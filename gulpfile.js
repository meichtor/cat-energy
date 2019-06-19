"use strict";

// Assets
const gulp = require("gulp");
const sass = require("gulp-sass");
const imagemin = require("gulp-imagemin");
const pngquant = require("imagemin-pngquant");
const svgstore = require("gulp-svgstore");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cleancss = require("gulp-cleancss");
const rename = require("gulp-rename");
const newer = require("gulp-newer");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const del = require("del");
const server = require("browser-sync").create();

// Scss
gulp.task("css", function() {
  return gulp
    .src("app/sass/main.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(
      postcss([
        autoprefixer({
          browsers: [
            "last 2 version",
            "last 7 Chrome versions",
            "last 10 Opera versions",
            "last 7 Firefox versions"
          ]
        })
      ])
    )
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("./build/css/"))
    .pipe(rename("style.min.css"))
    .pipe(cleancss())
    .pipe(gulp.dest("./build/css/"))
    .pipe(server.stream());
});

// HTML
gulp.task("html", function() {
  return gulp
    .src("app/*.html")
    .pipe(plumber())
    .pipe(gulp.dest("./build"));
});

// Images
gulp.task("img", function() {
  return gulp
    .src(["app/img/**/*.{gif,png,jpg,jpeg,svg}"])
    .pipe(plumber())
    .pipe(newer("./build/img"))
    .pipe(
      imagemin({
        optimizationLevel: 3,
        progressive: true,
        interlaced: true,
        svgoPlugins: [{ removeViewBox: false }],
        use: [pngquant()]
      })
    )
    .pipe(gulp.dest("./build/img"));
});

// Svg
gulp.task("svg", function() {
  return gulp
    .src(["app/img/icons/**/*.svg"])
    .pipe(
      imagemin({
        svgoPlugins: [{ removeViewBox: false }]
      })
    )
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("./build/img/icons"));
});

// Fonts
gulp.task("fonts", function() {
  return gulp
    .src("app/fonts/**/*.{woff,woff2}")
    .pipe(gulp.dest("./build/fonts"));
});

// Javascript
gulp.task("js", function() {
  return gulp
    .src("app/js/script.js")
    .pipe(plumber())
    .pipe(concat("script.js"))
    .pipe(gulp.dest("./build/js"))
    .pipe(rename("script.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest("./build/js"));
});

// Clean build task
gulp.task("clean", function() {
  return del(["build/**/*", "!build/readme.md"]);
});

//Build all
gulp.task(
  "build",
  gulp.series(
    "clean",
    gulp.parallel("css", "img", "svg", "js", "fonts"),
    "html"
  )
);

// Local server + watching
gulp.task("server", function() {
  server.init({
    server: "./build",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("app/img/**/*.{gif,png,jpg,jpeg,svg}", gulp.series("img"));
  gulp.watch("app/js/**/*.js", gulp.series("js"));
  gulp.watch("app/sass/**/*.{scss,sass}", gulp.series("css"));
  gulp.watch("app/*.html", gulp.series("html", reload));
});

// Reload HTML
function reload(done) {
  server.reload();
  done();
}

//  Start
gulp.task("default", gulp.series("build", "server"));
