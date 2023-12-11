// https://observablehq.com/@codedragon491/voronoi-stippling/3@413
let width = 624;
let height = 352;

function _n(width, height) {
  const n = Math.round((width * height) / 80);
  return n;
}
async function loadCSV() {
  const data = await d3.csv("data/labeled.csv");
  return data;
}

function _height(data) {
  return data.height;
}

function _2(DOM, width, height, script, invalidation, data, n) {
  const context = DOM.context2d(width, height);
  const worker = new Worker(script);

  function messaged({ data: points }) {
    const pointData = [];
    const canvas = context.canvas;
    for (let i = 0, n = points.length / 2; i < n; i++) {
      const x = points[i * 2],
        y = points[i * 2 + 1];
      context.moveTo(x + 1.5, y);
      context.arc(x, y, 1.5, 0, 2 * Math.PI);

      // Associate each point with data from mappedData
      if (i < mappedData.length) {
        pointData.push({ x, y, text: mappedData[i].text });
      }
    }
    context.fillStyle = "#000000";
    context.fill();
  }

  invalidation.then(() => worker.terminate());
  worker.addEventListener("message", messaged);
  worker.postMessage({ data, width, height, n });
  return context.canvas;
}

async function _script(require, invalidation) {
  const blob = new Blob(
    [
      `
importScripts("${await require.resolve("d3-delaunay@^5.1.1")}");

onmessage = event => {
  const {data: {data, width, height, n}} = event;
  const points = new Float64Array(n * 2);
  const c = new Float64Array(n * 2);
  const s = new Float64Array(n);

  // Initialize the points using rejection sampling.
  for (let i = 0; i < n; ++i) {
    for (let j = 0; j < 30; ++j) {
      const x = points[i * 2] = Math.floor(Math.random() * width);
      const y = points[i * 2 + 1] = Math.floor(Math.random() * height);
      if (Math.random() < data[y * width + x]) break;
    }
  }

  const delaunay = new d3.Delaunay(points);
  const voronoi = delaunay.voronoi([0, 0, width, height]);

  for (let k = 0; k < 80; ++k) {

    // Compute the weighted centroid for each Voronoi cell.
    c.fill(0);
    s.fill(0);
    for (let y = 0, i = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const w = data[y * width + x];
        i = delaunay.find(x + 0.5, y + 0.5, i);
        s[i] += w;
        c[i * 2] += w * (x + 0.5);
        c[i * 2 + 1] += w * (y + 0.5);
      }
    }

    // Relax the diagram by moving points to the weighted centroid.
    // Wiggle the points a little bit so they don’t get stuck.
    const w = Math.pow(k + 1, -0.8) * 10;
    for (let i = 0; i < n; ++i) {
      const x0 = points[i * 2], y0 = points[i * 2 + 1];
      const x1 = s[i] ? c[i * 2] / s[i] : x0, y1 = s[i] ? c[i * 2 + 1] / s[i] : y0;
      points[i * 2] = x0 + (x1 - x0) * 1.8 + (Math.random() - 0.5) * w;
      points[i * 2 + 1] = y0 + (y1 - y0) * 1.8 + (Math.random() - 0.5) * w;
    }

    postMessage(points);
    voronoi.update();
  }

  close();
};
`,
    ],
    { type: "text/javascript" }
  );
  const script = URL.createObjectURL(blob);
  invalidation.then(() => URL.revokeObjectURL(script));
  return script;
}

function _data(FileAttachment, width, DOM) {
  return FileAttachment("image1 (1).jpg")
    .image()
    .then((image) => {
      const height = Math.round((width * image.height) / image.width);
      const context = DOM.context2d(width, height, 1);
      context.drawImage(
        image,
        0,
        0,
        image.width,
        image.height,
        0,
        0,
        width,
        height
      );
      const { data: rgba } = context.getImageData(0, 0, width, height);
      const data = new Float64Array(width * height);
      for (let i = 0, n = rgba.length / 4; i < n; ++i)
        data[i] = Math.max(0, 1 - rgba[i * 4] / 254);
      data.width = width;
      data.height = height;
      return data;
    });
}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() {
    return this.url;
  }
  const fileAttachments = new Map([
    [
      "image1 (1).jpg",
      {
        url: new URL("/img/white-house.png", import.meta.url),
        mimeType: "image/jpeg",
        toString,
      },
    ],
  ]);
  main.builtin(
    "FileAttachment",
    runtime.fileAttachments((name) => fileAttachments.get(name))
  );
  main
    .variable(observer())
    .define(
      ["DOM", "width", "height", "script", "invalidation", "data", "n"],
      _2
    );
  main
    .variable(observer("script"))
    .define("script", ["require", "invalidation"], _script);
  main
    .variable(observer("data"))
    .define("data", ["FileAttachment", "width", "DOM"], _data);
  main.variable(observer("n")).define("n", ["width", "height"], _n);
  main.variable(observer("height")).define("height", ["data"], _height);
  return main;
}

const n = _n(width, height);
const csvData = await loadCSV();
const mappedData = csvData.slice(-n);

