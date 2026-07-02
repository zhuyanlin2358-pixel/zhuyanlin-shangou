import{l as g}from"./index-BuKstfFl.js";import{b as m}from"./vendor-ui-CVF_-_CF.js";import{R as y,T as w,P as R,M as A,C as S}from"./vendor-ogl-D65LfHA1.js";import"./vendor-jszip-DwBGDjL6.js";import"./vendor-gsap-CzGW6FVa.js";const z=`#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`,E=`#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ),
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {                int index = 0;                                              for (int i = 0; i < 2; i++) {                                    ColorStop currentColor = colors[i];                         bool isInBetween = currentColor.position <= factor;         index = int(mix(float(index), float(i), float(isInBetween)));   }                                                           ColorStop currentColor = colors[index];                     ColorStop nextColor = colors[index + 1];                    float range = nextColor.position - currentColor.position;   float lerpFactor = (factor - currentColor.position) / range;   finalColor = mix(currentColor.color, nextColor.color, lerpFactor); }

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);

  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);

  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;

  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);

  vec3 auroraColor = intensity * rampColor;

  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`;function T({colorStops:i=["#ffe100","#8449ff","#ff27b2"],amplitude:l=1,blend:a=1,speed:v=.8}){const x=m.useRef({colorStops:i,amplitude:l,blend:a,speed:v});x.current={colorStops:i,amplitude:l,blend:a,speed:v};const p=m.useRef(null);return m.useEffect(()=>{const t=p.current;if(!t)return;const s=new y({alpha:!0,premultipliedAlpha:!0,antialias:!0}),o=s.gl;o.clearColor(0,0,0,0),o.enable(o.BLEND),o.blendFunc(o.ONE,o.ONE_MINUS_SRC_ALPHA),o.canvas.style.backgroundColor="transparent";let n;function u(){if(!t)return;const r=t.offsetWidth,e=t.offsetHeight;s.setSize(r,e),n&&(n.uniforms.uResolution.value=[r,e])}window.addEventListener("resize",u);const c=new w(o);c.attributes.uv&&delete c.attributes.uv;const d=r=>{const e=new S(r);return[e.r,e.g,e.b]};n=new R(o,{vertex:z,fragment:E,uniforms:{uTime:{value:0},uAmplitude:{value:l},uColorStops:{value:i.map(d)},uResolution:{value:[t.offsetWidth,t.offsetHeight]},uBlend:{value:a}}});const h=new A(o,{geometry:c,program:n});t.appendChild(o.canvas);let f=0;const C=r=>{f=requestAnimationFrame(C);const e=x.current;n.uniforms.uTime.value=r*.001*(e.speed??.8)*.1,n.uniforms.uAmplitude.value=e.amplitude??1,n.uniforms.uBlend.value=e.blend??1,n.uniforms.uColorStops.value=(e.colorStops??i).map(d),s.render({scene:h})};return f=requestAnimationFrame(C),u(),()=>{var r;cancelAnimationFrame(f),window.removeEventListener("resize",u),t&&o.canvas.parentNode===t&&t.removeChild(o.canvas),(r=o.getExtension("WEBGL_lose_context"))==null||r.loseContext()}},[]),g.jsx("div",{ref:p,style:{width:"100%",height:"100%"}})}export{T as default};
