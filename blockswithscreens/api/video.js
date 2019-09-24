const fs = require('fs');
const memory = {};

const TMP_DIR = '/tmp/blockswithscreens';

function ensureDirSync(dirpath) {
  try {
    fs.mkdirSync(dirpath, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

ensureDirSync(TMP_DIR);

// http://localhost:3000/api/video?mode=write&block=56&data=0001
// http://localhost:3000/api/video?mode=read&block=56

// Working with Octet Streams in Javascript
// https://medium.com/@julientregoat/working-with-octet-streams-in-javascript-d43d81ad7f47

module.exports = (req, res) => {
  const timeStart = Date.now();

  const { mode, block } = req.query;

  console.info({ req });
  console.info(req.body);

  switch (mode) {
    case 'write': {
      const data = [];

      req
        .on('data', chunk => {
          console.info('chunk', chunk);
          data.push(chunk);
        })
        .on('end', () => {
          //at this point data is an array of Buffers
          //so Buffer.concat() can make us a new Buffer
          //of all of them together
          const buffer = Buffer.concat(data);
          console.info('buffer', buffer);

          fs.writeFileSync(
            `${TMP_DIR}/${block}`,
            buffer,
            err => err && console.error(err)
          );
        });

      const timeEnd = Date.now();
      const response = {
        success: true,
        time: timeEnd - timeStart,
      };

      console.info(req.url, response);
      return res.json(response);
    }
    case 'read':
    default: {
      const path = `${TMP_DIR}/${block}`;
      let data = null;
      if (fs.existsSync(path)) {
        data = fs.readFileSync(path, 'utf8');
      }

      const timeEnd = Date.now();
      const response = {
        block,
        data,
        time: timeEnd - timeStart,
      };
      console.info(req.url, response);
      return res.json(response);
    }
  }
};
