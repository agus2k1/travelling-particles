const fragmentShader = /* glsl */ `
    varying vec2 vUv;
    varying vec2 vPosition;
    varying float vOpacity;

    void main() {
        gl_FragColor = vec4(1.) * vOpacity;
    }
`;

export default fragmentShader;
