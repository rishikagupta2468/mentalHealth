var ejs = require("ejs"),
  express = require("express"),
  multer = require("multer"),
  path = require("path"),
  excel = require("exceljs"),
  bodyParser = require("body-parser"),
  app = express();

app.use(express.static(path.join(__dirname, "assets")));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Data");
  },
  filename: function (req, file, cb) {
    cb(null, "user_dataset_input.xlsx");
  },
});
var upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    var filetypes = /csv|xml|xlsx/;
    var mimetype = filetypes.test(file.mimetype);

    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb(
      "Error: File upload only supports the " +
        "following filetypes - " +
        filetypes
    );
  },
}).single("user-data");

var wb = new excel.Workbook();

app.get("/", function (req, res) {
  let suicidalObj = new Array();
  let nsuicidalObj = new Array();
  let diff = [0, 0],
    retweet = [0, 0, 0, 0],
    nretweet = [0, 0, 0, 0];
  let week = [0, 0, 0, 0, 0, 0, 0],
    nweek = [0, 0, 0, 0, 0, 0, 0];
  let clock = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    nclock = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
  let sCount = [],
    nsCount = [];
  sCount.push(["Location", "Count"]);
  nsCount.push(["Location", "Count"]);
  res.render("dashboard", {
    nsuicidalObj: nsuicidalObj,
    suicidalObj: suicidalObj,
    retweet: retweet,
    diff: diff,
    week: week,
    clock: clock,
    sCount: sCount,
    nretweet: nretweet,
    nweek: nweek,
    nclock: nclock,
    nsCount: nsCount,
  });
});

app.get("/guidelines", function (req, res) {
  res.render("guidelines");
});
app.post("/uploadData", function (req, res) {
  upload(req, res, function (err) {
    if (err) {
      res.send(err);
    } else {
      const execSync = require("child_process").execSync;
      // run = execSync(
      //   "python ./Machine_learning/preprocessing_data.py"
      // ).toString();
      try {
        run = execSync("python ./Machine_learning/test_script.py").toString();
        console.log("Model complete");
        let suicidalObj = new Array();
        let nsuicidalObj = new Array();
        let diff = [0, 0],
          retweet = [0, 0, 0, 0],
          nretweet = [0, 0, 0, 0];
        let week = [0, 0, 0, 0, 0, 0, 0],
          nweek = [0, 0, 0, 0, 0, 0, 0];
        let clock = [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0,
          ],
          nclock = [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0,
          ];
        let sCount = [],
          nsCount = [];
        sCount.push(["Location", "Count"]);
        nsCount.push(["Location", "Count"]);
        wb.xlsx
          .readFile(path.resolve(__dirname, "Data/output.xlsx"))
          .then(function () {
            var sh = wb.getWorksheet();
            for (i = 1; i <= sh.rowCount; i++) {
              if (sh.getRow(i).getCell(7).value == "Suicidal") {
                var loc = sh.getRow(i).getCell(5).value;
                if (loc && (typeof loc === "string" || loc instanceof String)) {
                  sCount.push([loc, 1]);
                  if (suicidalObj.length < 5) {
                    suicidalObj.push({
                      Date: sh.getRow(i).getCell(1).value,
                      Text: sh.getRow(i).getCell(2).value,
                      Name: sh.getRow(i).getCell(3).value,
                      Location: sh.getRow(i).getCell(5).value,
                    });
                  }
                }
                diff[0] = diff[0] + 1;
                let day = sh.getRow(i).getCell(1).value;
                day = day.substring(0, 3);
                switch (day) {
                  case "Mon":
                    week[0]++;
                    break;
                  case "Tue":
                    week[1]++;
                    break;
                  case "Wed":
                    week[2]++;
                    break;
                  case "Thu":
                    week[3]++;
                    break;
                  case "Fri":
                    week[4]++;
                    break;
                  case "Sat":
                    week[5]++;
                    break;
                  case "Sun":
                    week[6]++;
                  default:
                    week[0]++;
                }
                let time = sh.getRow(i).getCell(1).value;
                time = time.substring(11, 13);
                time = parseInt(time);
                if (time <= 23) {
                  clock[time]++;
                }
                let rc = sh.getRow(i).getCell(6).value;
                if (rc < 10 || rc) {
                  retweet[0] = retweet[0] + 1;
                } else if (rc < 50) {
                  retweet[1] = retweet[1] + 1;
                } else if (rc < 100) {
                  retweet[2] = retweet[2] + 1;
                } else {
                  retweet[3] = retweet[3] + 1;
                }
              } else if (sh.getRow(i).getCell(7).value == "Not suicidal") {
                var nloc = sh.getRow(i).getCell(5).value;
                if (
                  nloc &&
                  (typeof loc === "string" || nloc instanceof String)
                ) {
                  nsCount.push([nloc, 1]);
                  if (nsuicidalObj.length < 5) {
                    nsuicidalObj.push({
                      Date: sh.getRow(i).getCell(1).value,
                      Text: sh.getRow(i).getCell(2).value,
                      Name: sh.getRow(i).getCell(3).value,
                      Location: sh.getRow(i).getCell(5).value,
                    });
                  }
                }
                let nday = sh.getRow(i).getCell(1).value;
                nday = nday.substring(0, 3);
                switch (nday) {
                  case "Mon":
                    nweek[0]++;
                    break;
                  case "Tue":
                    nweek[1]++;
                    break;
                  case "Wed":
                    nweek[2]++;
                    break;
                  case "Thu":
                    nweek[3]++;
                    break;
                  case "Fri":
                    nweek[4]++;
                    break;
                  case "Sat":
                    nweek[5]++;
                    break;
                  case "Sun":
                    nweek[6]++;
                    break;
                  default:
                    nweek[0]++;
                }
                let ntime = sh.getRow(i).getCell(1).value;
                ntime = ntime.substring(11, 13);
                ntime = parseInt(ntime);
                if (ntime <= 23) {
                  nclock[ntime]++;
                }
                let nrc = sh.getRow(i).getCell(6).value;
                if (nrc < 10) {
                  nretweet[0] = nretweet[0] + 1;
                } else if (nrc < 50) {
                  nretweet[1] = nretweet[1] + 1;
                } else if (nrc < 100) {
                  nretweet[2] = nretweet[2] + 1;
                } else {
                  nretweet[3] = nretweet[3] + 1;
                }
                diff[1] = diff[1] + 1;
              }
            }
            res.render("dashboard", {
              nsuicidalObj: nsuicidalObj,
              suicidalObj: suicidalObj,
              retweet: retweet,
              diff: diff,
              week: week,
              clock: clock,
              sCount: sCount,
              nretweet: nretweet,
              nweek: nweek,
              nclock: nclock,
              nsCount: nsCount,
            });
          });
      } catch (err) {
        console.log("err");
        console.log(err.stdout);
      }
    }
  });
});

app.get("/output", function (req, res) {
  var outputPath = path.join(__dirname, "Data/output.xlsx");
  res.sendFile(outputPath);
});

app.get("/downloadSample", function (req, res) {
  var outputPath = path.join(__dirname, "Data/sample_dataset.xlsx");
  res.sendFile(outputPath);
});
app.listen(process.env.PORT || 8000, function () {
  console.log("Server Has Started!");
});
