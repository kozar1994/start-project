'use strict';

const gulp = require("gulp");
const scss = require("gulp-sass"); // припроцесор css
const browserSync = require("browser-sync").create(); // веб сервер для авто обновлення сторінки і не тільки
const sourcemaps = require("gulp-sourcemaps"); // плагін для побудови карт в scss і js
const notify = require("gulp-notify"); // плагін для сповіщення про помилки
const autoprefixer = require("gulp-autoprefixer"); // плагін для css добаляє префікси до різних браузерів
const pug = require("gulp-pug"); // припроцесор html
const del = require('del'); // для видалення попок файлів
const plumber = require('gulp-plumber'); // щоб ловити помилки в потоці

var way = {
    "root": "./public",
    "theme":"frontend/template/*.pug",
    "style":"frontend/style/app.scss",
    "js":"frontend/js/**/*.js"
};

/*gulp.task("default",gulp.series(""));*/


gulp.task("clear",function(){
   return del(way.root);
});

//javascript
/*
* gulp.lastRun("js") - ми провіряємо коли останій раз було обновлення js файлів
* потрібно для watch щоб не кожен раз перезаписувати а обновляти
*/
gulp.task("js",function(){
    return gulp.src(way.js,{since: gulp.lastRun("js")})
        .pipe(gulp.dest(way.root+"/js"))
});

//html
gulp.task("templates",function(){
    return gulp.src(way.theme)
        .pipe(pug({ pretty:true }))
        .on("error", notify.onError(function(error){ //вибиваємо помилку
            return {
                title: 'Pug',
                message:  error.message
            }
        }))
        .pipe(gulp.dest(way.root));
});

gulp.task("style",function(){
   return gulp.src(way.style)
        .pipe(plumber({
            errorHandler: notify.onError(function(err){
                return {
                    title: "Style",
                    message: err.message
                }
            })
        }))
        .pipe(sourcemaps.init())
            .pipe(scss())
            //.on("error",notify.onError({ title: 'Style' })) //вибиваємо помилку
            .pipe(autoprefixer())
        .pipe(sourcemaps.write())
    .pipe(gulp.dest(way.root+"/style"))
});

gulp.task("watch",function(){
    gulp.watch("frontend/style/**/*.scss",gulp.series("style"));
    gulp.watch("frontend/js/**/*.js",gulp.series("js"));
    gulp.watch("frontend/template/**/*.pug",gulp.series("templates"));
});

gulp.task("serve",function(){
    browserSync.init({
        server: way.root
    });

    browserSync.watch("public/**/*.*").on("change",browserSync.reload);
});

gulp.task("build",gulp.series("templates","style","js"));

gulp.task("default",gulp.series("clear","build",gulp.parallel("watch","serve")));

