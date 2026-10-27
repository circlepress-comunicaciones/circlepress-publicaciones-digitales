(() => {
  const canvas = document.querySelector('#hero-canvas');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, powerPreference: 'low-power' });
  if (!gl) return;

  const vertexSource = 'attribute vec2 position; void main(){gl_Position=vec4(position,0.0,1.0);}';
  const fragmentSource = `
    precision mediump float;
    uniform vec2 resolution;
    uniform float time;

    vec3 brandColor(float x) {
      vec3 red = vec3(0.91, 0.12, 0.13);
      vec3 gold = vec3(0.97, 0.79, 0.16);
      vec3 green = vec3(0.10, 0.61, 0.28);
      vec3 blue = vec3(0.12, 0.36, 0.79);
      x = fract(x) * 4.0;
      if (x < 1.0) return mix(red, gold, smoothstep(0.0, 1.0, x));
      if (x < 2.0) return mix(gold, green, smoothstep(0.0, 1.0, x - 1.0));
      if (x < 3.0) return mix(green, blue, smoothstep(0.0, 1.0, x - 2.0));
      return mix(blue, red, smoothstep(0.0, 1.0, x - 3.0));
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / resolution;
      uv.y = 1.0 - uv.y;
      float aspect = resolution.x / resolution.y;
      vec2 p = vec2(uv.x * aspect, uv.y);
      float drift = sin(time * 0.045) * 0.045;
      float diagonal = (p.x - p.y * 0.9 + drift) * 3.1;
      float lane = floor(diagonal);
      float within = fract(diagonal);
      float along = p.x * 0.27 + p.y * 0.80;
      float curve = sin(along * 3.0 + lane * 0.09 - time * 0.055);
      float reflection = 0.32 + curve * 0.25;
      float distanceToLight = abs(within - reflection);
      float silk = exp(-distanceToLight * distanceToLight * 22.0);
      float fineReflection = exp(-pow((within - reflection - 0.09) * 34.0, 2.0));
      float band = 1.0 - smoothstep(0.65, 0.67, within);
      float angleShade = smoothstep(0.01, 0.27, within);
      vec3 color = brandColor(within * 1.07 + along * 0.15 + lane * 0.16 - time * 0.008);
      vec3 material = color * (0.24 + silk * 0.95 + fineReflection * 0.20);
      material += vec3(0.82, 0.85, 0.81) * pow(silk, 4.0) * 0.38;
      material *= angleShade;
      vec3 dark = vec3(0.022, 0.028, 0.026);
      vec3 result = mix(dark, material, band);
      float edge = smoothstep(0.0, 0.22, uv.x) * (1.0 - smoothstep(0.79, 1.0, uv.x));
      float fade = 1.0 - smoothstep(0.70, 1.0, uv.y);
      float centerShade = 1.0 - exp(-pow((uv.x - 0.5) * 2.4, 2.0)) * 0.23;
      result = mix(dark, result, edge * fade * centerShade * 0.87);
      gl_FragColor = vec4(result, 1.0);
    }
  `;

  function shader(type, source) {
    const item = gl.createShader(type);
    gl.shaderSource(item, source);
    gl.compileShader(item);
    if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) { gl.deleteShader(item); return null; }
    return item;
  }
  const vertex = shader(gl.VERTEX_SHADER, vertexSource);
  const fragment = shader(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) return;
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const resolution = gl.getUniformLocation(program, 'resolution');
  const time = gl.getUniformLocation(program, 'time');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let lastPaint = 0;
  let visible = true;

  function paint(timestamp = 0) {
    if (timestamp - lastPaint > 40 || !timestamp || reducedMotion.matches) {
      lastPaint = timestamp;
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform1f(time, reducedMotion.matches ? 12.0 : timestamp / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    if (visible && !document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(paint);
  }
  function resume() {
    cancelAnimationFrame(frame);
    lastPaint = 0;
    paint(0);
  }
  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(bounds.width * ratio));
    canvas.height = Math.max(1, Math.round(bounds.height * ratio));
    gl.viewport(0, 0, canvas.width, canvas.height);
    resume();
  }
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; resume(); }).observe(canvas);
  document.addEventListener('visibilitychange', resume);
  reducedMotion.addEventListener('change', resume);
})();
