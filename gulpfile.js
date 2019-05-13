"use strict";

// Инструменты для работы
const gulp = require("gulp");
const sass = require("gulp-sass");
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

// Сборка CSS из SCSS
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

// Сборка HTML
gulp.task("html", function() {
  return gulp
    .src("app/*.html")
    .pipe(plumber())
    .pipe(gulp.dest("./build"));
});

// Сборка изображений
gulp.task("img", function() {
  return gulp
    .src(
      ["app/img/*.{gif,png,jpg,jpeg,svg}"],
      { since: gulp.lastRun("img") } // оставим в потоке обработки только изменившиеся от последнего запуска задачи файлы
    )
    .pipe(plumber())
    .pipe(newer("./build/img")) // оставить в потоке только новые файлы (сравниваем с содержимым папки билда)
    .pipe(gulp.dest("app/img"));
});

// Сборка шрифтов
gulp.task("fonts", function() {
  return gulp.src("app/fonts/**/*.{woff,woff2}").pipe(gulp.dest("build/fonts"));
});

// Сборка Javascript
gulp.task("js", function() {
  return gulp
    .src("app/js/script.js")
    .pipe(plumber())
    .pipe(concat("script.js"))
    .pipe(gulp.dest("./build/js"))
    .pipe(rename("script.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest("./build/js"))
    .pipe(server.reload({ stream: true }));
});

// Очистка папки build
gulp.task("clean", function() {
  return del([
    "build/**/*", // все файлы из папки сборки
    "!build/readme.md" // кроме readme.md
  ]);
});

//Общая сборка всего
gulp.task(
  "build",
  gulp.series("clean", gulp.parallel("css", "img", "js", "fonts"), "html")
);

// Локальный сервер + отслеживание изменений
gulp.task("server", function() {
  server.init({
    server: "./build",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("app/img/*.{gif,png,jpg,jpeg,svg}", gulp.series("img"));
  gulp.watch("app/js/**/*.js", gulp.series("js"));
  gulp.watch("app/sass/**/*.{scss,sass}", gulp.series("css"));
  gulp.watch("app/*.html", gulp.series("html", reload));
});

// Перезагрузка HTML
function reload(done) {
  server.reload();
  done();
}

//  Запускаем делаем сборку, запускаем сервер и следим
gulp.task("default", gulp.series("build", "server"));
