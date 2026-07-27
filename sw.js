/**
 * 最小 Service Worker —— 闪购工具
 *
 * 目标:二次访问秒开(缓存优先) + 迭代不察觉(新版下次刷新生效,不打断当前会话)
 *
 * 策略:
 *   install  : 预缓存首页 '/',失败也不阻塞(SW 仍可注册)
 *   fetch    : 缓存优先。命中→立即返回(秒开),同时后台更新缓存;
 *              未命中→走网络,成功后存入缓存
 *   activate : 清理非当前版本缓存,避免膨胀
 *
 * 版本更新:每次发版把 CACHE 改个新值(如 sg-v3)。新 SW 安装后等所有旧标签页关闭
 *          才 activate,用户下次刷新自动用新版——不打断当前会话。
 *          (不调 skipWaiting,刻意让旧页继续跑完,避免半新半旧)
 *
 * 注意:开发环境(dev)不注册 SW(见 main.tsx),避免缓存热重载产物。
 */
const CACHE = 'sg-1785120792733'

// 预缓存:首页。HTML 是入口,缓存它就能秒开首屏骨架
const PRECACHE = ['./']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // addAll 失败会整个 reject,这里逐个 add 容错(首页缓存失败也不阻塞注册)
      Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => {}))),
    ),
  )
  // 不调 skipWaiting:新 SW 装好后等旧标签页都关闭才 activate。
  // 用户当前会话继续用旧版(旧 JS 已在跑),下次刷新自然用新版——迭代不察觉。
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  // 只处理同源 GET(跨域/POST 不缓存)
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          // 成功且是正常响应才存(避免缓存错误页)
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
          }
          return res
        })
        .catch(() => cached) // 网络失败(离线)→回退缓存

      // 有缓存立即返回(秒开),后台同时更新;无缓存等网络
      return cached || network
    }),
  )
})
