const fragmentShader = /* glsl */ `
    varying vec2 vUv;
    varying vec2 vPosition;
    varying float vOpacity;

    void main() {
        vec2 uv = vec2(gl_PointCoord.x, 1. - gl_PointCoord.y);
        vec2 cUV = 2. * uv - 1.; // Centralized UV

        vec3 originalColor = vec3(4. / 255., 10. / 255., 20. / 255.); // Particles color

        vec4 color = vec4(0.08 / length(cUV));

        color.rgb = min(vec3(10.), color.rgb);

        color.rgb *= originalColor * 120.; // Change

        color *= vOpacity;

        color.a = min(1., color.a) * 10.; // Change last value for brightness

        float disc = length(cUV);

        gl_FragColor = vec4(1. - disc, 0., 0., 1.) * vOpacity;
        gl_FragColor = vec4(color.rgba);
    }
`;

export default fragmentShader;
