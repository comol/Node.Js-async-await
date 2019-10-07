"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
let srcpath = '';
let dstpath = '';
let needdelete = false;
let destdirs = [];
let Args = process.argv.slice(2);
let fsPromises = fs.promises;
//Копирует файл в правильный каталог по заданным правилам
async function copyfile(src, needdelete) {
    let filestring = src;
    let firstletter = getshortfilename(filestring).substr(0, 1);
    let srcfile = src;
    let dstfile = path.join(dstpath, firstletter, getshortfilename(src));
    if (destdirs.indexOf(firstletter) == -1) {
        let dirpath = path.join(dstpath, firstletter);
        destdirs.push(firstletter);
        let exists = true;
        try {
            await fsPromises.access(dirpath);
        }
        catch (err) {
            exists = false;
        }
        if (!exists) {
            await fsPromises.mkdir(dirpath);
            await syscopyfile(srcfile, dstfile, needdelete);
        }
    }
    else {
        await syscopyfile(srcfile, dstfile, needdelete);
    }
}
async function syscopyfile(srcfile, dstfile, move) {
    let exists = true;
    try {
        await fsPromises.access(dstfile);
    }
    catch (err) {
        exists = false;
    }
    if (!exists) {
        await fsPromises.copyFile(srcfile, dstfile);
        {
            if (move) {
                await fsPromises.unlink(srcfile);
            }
        }
    }
}
// Копирует и удаляет файлы в нужную папку
// рекурсивная функция
async function ReadAllFiles(dir, needdelete) {
    let readfiles = await fsPromises.readdir(dir).then();
    for (let i in readfiles) {
        let name = path.join(dir, readfiles[i]);
        let filestats = await fsPromises.stat(name).then();
        if (filestats.isDirectory()) {
            await ReadAllFiles(name, needdelete);
            await fsPromises.rmdir(name);
        }
        else {
            await copyfile(name, needdelete);
        }
    }
}
// получает короткое имя файлов по полному
function getshortfilename(filename) {
    let filearray = filename.split('\\');
    let shortfilename = filearray[filearray.length - 1];
    return shortfilename;
}
// Основной раздел
if (Args.length < 2) {
    console.log('Usage: app.ts <source path> <destination path> [-delete]');
    process.exit(0);
}
if (Args.length == 3) {
    if (Args[2] == '-delete') {
        needdelete = true;
    }
}
srcpath = Args[0];
dstpath = Args[1];
ReadAllFiles(srcpath, needdelete);
//# sourceMappingURL=app.js.map