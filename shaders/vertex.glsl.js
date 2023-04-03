const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec2 vPosition;
  varying float vOpacity;

  attribute float opacity;

  void main() {
    vUv = uv;
    vOpacity = opacity;

    vec4 mvPosition = modelViewMatrix * vec4( position, 1. );
    gl_PointSize = 1000. * ( 1. / - mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export default vertexShader;
