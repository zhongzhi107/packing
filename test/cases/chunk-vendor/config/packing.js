export default (packing) => {
  const p = packing;
  p.path.src.root = '.';
  p.path.entries = {
    a: './a.js'
  };
  p.eslint.enable = false;
  p.stylelint.enable = false;
  p.runtimeChunk.enable = true;
  p.commonChunks = {
    vendor: [
      'ccc', 'sub/bbb', 'sub2/', './d', './useless'
    ]
  };
  p.template.autoGeneration = false;
  p.minimize = false;
  return p;
};
