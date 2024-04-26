//gulpとgulpのパッケージを読み込み
const gulp = require("gulp");//本体
const { src, dest, watch, lastRun, parallel, series } = require("gulp");
const sass = require("gulp-dart-sass"); //DartSassを使う
const glob = require("gulp-sass-glob-use-forward"); //DartSassのimportを楽にする
const postcss = require("gulp-postcss"); //Autoprefixと一緒に使うもの
const autoprefixer = require("autoprefixer"); //Autoprefix
const plumber = require("gulp-plumber"); //エラーでも強制終了させない
const notify = require("gulp-notify"); //エラーのときはデスクトップに通知
const del = require("del"); //ファイル、ディレクトリの削除 // ※7系だとエラーが出るので6系を入れる
const ejs = require("gulp-ejs"); //htmlのパーツ化
const rename = require("gulp-rename"); //ejsの拡張子を変更
const babel = require("gulp-babel"); //JavaScriptのトランスパイル用
const uglify = require("gulp-uglify"); //JavaScriptの圧縮用
const browserSync = require("browser-sync"); //ブザウザ読み込み・反映
const replace = require("gulp-replace"); //余計なテキストを削除
const imagemin = require('gulp-imagemin');//画像を圧縮する ※エラーが出るので7系を入れる
const mmq = require( 'gulp-merge-media-queries' );//mqごとに分ける

//読み込むパスと出力するパスを指定
const srcPath = {
  html: {
//    src: ["./src/ejs/**/*.ejs", "!" + "./src/ejs/**/_*.ejs"],
    src: ["./src/ejs/**/*.ejs", "./src/ejs/**/_*.ejs"],
    dist: "./dist/"
  },
  styles: {
    src: "./src/scss/**/*.scss",
    dist: "./dist/css/",
    map: "./dist/css/map"
  },
  scripts: {
    src: "./src/js/**/*.js",
    dist: "./dist/js/",
    map: "./dist/js/map"
  },
  images: {
    src: "./src/img/**/*.{jpg,jpeg,png,gif,svg}",
    dist: "./dist/img/"
  }
};

//htmlの処理自動化
const htmlFunc = () => {
  return src(srcPath.html.src)
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(ejs({}, {}, { ext: ".html" })) //ejsを纏める
    .pipe(rename({ extname: ".html" })) //拡張子をhtmlに
    .pipe(replace(/[\s\S]*?(<!DOCTYPE)/, "$1"))//空白を削除
    .pipe(dest(srcPath.html.dist))
    .pipe(browserSync.reload({ stream: true }));
};

//Sassの処理自動化（開発用）
const stylesFunc = () => {
  return src(srcPath.styles.src, { sourcemaps: true })
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(glob())
    .pipe(
        sass
          .sync({
            includePaths: ["node_modules", "src/scss"], //パスを指定
            outputStyle: "expanded"
          })
          .on("error", sass.logError)
      )
    .pipe(
      postcss([
        autoprefixer({
          // IEは11以上、Androidは4、ios safariは8以上
          // その他は最新2バージョンで必要なベンダープレフィックスを付与する
          //指定の内容はpackage.jsonに記入している
          cascade: false,
          grid: true
        })
      ])
    )
    .pipe(mmq())//こいつ入れると圧縮できない
    .pipe(dest(srcPath.styles.dist, { sourcemaps: "./map" }))
    .pipe(browserSync.reload({ stream: true }));
};

//Sassの処理自動化（圧縮用）
const stylesCompress = () => {
  return src(srcPath.styles.src)
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(glob())
    .pipe(
      sass
        .sync({
          includePaths: ["node_modules", "src/scss"], //パスを指定
          outputStyle: "compressed"
        })
        .on("error", sass.logError)
    )
    .pipe(
      postcss([
        autoprefixer({
          //上の指定と同じ
          cascade: false,
          grid: true
        })
      ])
    )
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(dest(srcPath.styles.dist))
};

//JavaScriptの処理自動化（開発用）
const scriptFunc = () => {
  return (
    src(srcPath.scripts.src, { sourcemaps: true })
      .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
      .pipe(
        babel({
          presets: ["@babel/env"]
        })
      )
      .pipe(dest(srcPath.scripts.dist, { sourcemaps: "./map" }))
      .pipe(browserSync.reload({ stream: true }))
  );
};

//JavaScriptの処理自動化（圧縮用）
const scriptCompress = () => {
  return (
    src(srcPath.scripts.src)
      .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
      .pipe(
        babel({
          presets: ["@babel/env"]
        })
      )
      .pipe(uglify({ output: { comments: /^!/ } }))
      .pipe(
        rename({
          suffix: ".min"
        })
      )
      .pipe(dest(srcPath.scripts.dist))
  );
};

// マップファイル除去
const cleanMap = () => {
  return del([srcPath.styles.map, srcPath.scripts.map]);
};


const imgMin = () => {
  return (
   gulp.src('./src/img/*')
   .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
   .pipe(imagemin())
   .pipe(gulp.dest('./dist/img/'))
  );
};

// ブラウザの読み込み処理
const browserSyncFunc = () => {
  browserSync({
    server: {
      baseDir: "./dist/",
      index: "index.html"
    },
    reloadOnRestart: true
  });
};

//自動化処理 ファイルに変更があったら反映、ファイルに変更があれば、引数2の関数を実行する
const watchFiles = () => {
  watch(srcPath.html.src, htmlFunc);
  watch(srcPath.styles.src, stylesFunc);
  watch(srcPath.scripts.src, scriptFunc);
  watch(srcPath.images.src, imgMin);
};

exports.default = parallel(watchFiles, browserSyncFunc); //npx gulpで実行 初期設定（フォルダ、ファイルの監視、ブラウザへの反映）
exports.build = parallel(htmlFunc, stylesFunc, scriptFunc , imgMin); //npx buildで実行 出力するだけの設定
exports.compress = parallel(stylesCompress, scriptCompress, cleanMap); //npx compressで実行 cssとJavaScriptの圧縮、mapフォルダの削除


