"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
exports.__esModule = true;
/**
 *  这个模块用来管理electron本地的聊天记录的存储和读取, 它使用一个map来管理一个userID => {wStream,rStream}的关系,
 *  通过判断mainThread通过postMessage中附带的类别和data来进行读取/储存用户发送的内容, 并通过postMessage方法来和mainThread沟通
 *
 *  存储结构:
 *  message:
 *      |   'id1'
 *      |   'id2'
 *              ...
 *  因为考虑到简单性以及不会有那么多信息储存, 使用单文件来存储使用者和各个用户之间的信息, 每个信息储存的形式为JSON.stringfy(), 并且隔行用"\n"分隔
 *  在编译的时候请将ESM的import切换为上面的CJS引入
 */
// const { parentPort } = require('node:worker_threads');
// const fs = require('node:fs');
// const stream = require('node:stream/promises');
// const readline = require('readline');
// const path = require('node:path');
var node_worker_threads_1 = require("node:worker_threads");
var fs = require("node:fs");
var fsP = require("node:fs/promises");
var path = require("node:path");
var cwd = process.cwd();
var NEW_LINE_CHARACTERS = ["\n"];
var _path = path.join(cwd, 'message');
var map = new Map();
node_worker_threads_1.parentPort === null || node_worker_threads_1.parentPort === void 0 ? void 0 : node_worker_threads_1.parentPort.on('message', function (data) {
    // check the data types in WorkerController.ts
    console.log('got message from main thread: ', data);
    var operateType = data.type;
    var content = data.content;
    switch (operateType) {
        case 'read':
            readMessage(content.userId, data.limit).then(function (res) {
                node_worker_threads_1.parentPort === null || node_worker_threads_1.parentPort === void 0 ? void 0 : node_worker_threads_1.parentPort.postMessage({
                    type: 'read',
                    content: {
                        messages: res === null || res === void 0 ? void 0 : res.messages,
                        userInfo: res === null || res === void 0 ? void 0 : res.userInfo
                    }
                });
            });
            break;
        case 'write':
            console.log('worker.ts got message: \n', data);
            writeMessage(content.userId, content.content, content.userInfo);
            break;
        default:
            break;
    }
});
/**
 * @description create wStream and rStream for target user, and store in map
 * @param userID id use to open target chat file
 */
function createStream(userID, userInfo) {
    return __awaiter(this, void 0, void 0, function () {
        var streamPath, indexFilePath, isIndexNewlyCreated, rStream, wStream, index, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    streamPath = path.join(_path, userID);
                    indexFilePath = path.join(_path, userID + '.json');
                    isIndexNewlyCreated = false;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 11, , 12]);
                    if (!!fs.existsSync(streamPath)) return [3 /*break*/, 3];
                    return [4 /*yield*/, createUserFile(streamPath)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    if (!!fs.existsSync(indexFilePath)) return [3 /*break*/, 5];
                    return [4 /*yield*/, createUserFile(indexFilePath)];
                case 4:
                    _a.sent();
                    isIndexNewlyCreated = true;
                    _a.label = 5;
                case 5:
                    rStream = fs.createReadStream(streamPath);
                    wStream = fs.createWriteStream(streamPath, { flags: 'a' });
                    return [4 /*yield*/, readJSON(indexFilePath)];
                case 6:
                    index = _a.sent();
                    if (!isIndexNewlyCreated) return [3 /*break*/, 9];
                    index = __assign(__assign({}, userInfo), { messageCounts: 0 });
                    return [4 /*yield*/, fsP.truncate(indexFilePath, 0)];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, fsP.writeFile(indexFilePath, JSON.stringify(index))];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 9:
                    Object.assign(index, userInfo);
                    _a.label = 10;
                case 10:
                    map.set(userID, {
                        // we set the default state for the user
                        rStream: rStream,
                        wStream: wStream,
                        indexFilePath: indexFilePath,
                        index: index
                    });
                    console.log('first create index: ', index);
                    return [3 /*break*/, 12];
                case 11:
                    error_1 = _a.sent();
                    handleFsError(error_1);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    });
}
function writeMessage(userID, content, userInfo) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, wStream, rStream, indexFilePath, index, updatedIndex, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    if (!!map.has(userID)) return [3 /*break*/, 2];
                    return [4 /*yield*/, createStream(userID, userInfo)];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2:
                    _a = map.get(userID), wStream = _a.wStream, rStream = _a.rStream, indexFilePath = _a.indexFilePath, index = _a.index;
                    updatedIndex = __assign(__assign({}, userInfo), { messageCounts: index.messageCounts + 1 });
                    // store updated user index and message content into file
                    // flag:'w' means overwrite the file
                    return [4 /*yield*/, fsP.truncate(indexFilePath, 0)];
                case 3:
                    // store updated user index and message content into file
                    // flag:'w' means overwrite the file
                    _b.sent();
                    return [4 /*yield*/, fsP.writeFile(indexFilePath, JSON.stringify(updatedIndex))];
                case 4:
                    _b.sent();
                    wStream.write(JSON.stringify(content));
                    wStream.write('\n');
                    // assign updatedIndex to map
                    map.set(userID, { rStream: rStream, wStream: wStream, indexFilePath: indexFilePath, index: updatedIndex });
                    console.log('check index: ', updatedIndex);
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _b.sent();
                    handleFsError(error_2);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function readMessage(userID, limit) {
    if (limit === void 0) { limit = 1; }
    return __awaiter(this, void 0, void 0, function () {
        var userPath, indexPath, res, userInfo, _a, _b, _c, _d, _e, error_3;
        var _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 5, , 6]);
                    userPath = path.join(_path, userID);
                    indexPath = path.join(_path, userID + '.json');
                    res = {
                        messages: [],
                        userInfo: null
                    };
                    if (!(fs.existsSync(userPath) && fs.existsSync(indexPath))) return [3 /*break*/, 4];
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, fsP.open(indexPath, 'r')];
                case 1: return [4 /*yield*/, (_g.sent()).readFile({ encoding: 'utf-8' })];
                case 2:
                    userInfo = _b.apply(_a, [_g.sent()]);
                    _d = (_c = (_f = res.messages).push).apply;
                    _e = [_f];
                    return [4 /*yield*/, readLines(userPath, limit)];
                case 3:
                    _d.apply(_c, _e.concat([(_g.sent())]));
                    res.userInfo = userInfo;
                    _g.label = 4;
                case 4: return [2 /*return*/, res];
                case 5:
                    error_3 = _g.sent();
                    handleFsError(error_3);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * @description use to create user's chat history
 * @param name  --the file name
 */
function createUserFile(name) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var directoryPath = path.dirname(name);
                    fs.mkdir(directoryPath, { recursive: true }, function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            fs.open(name, 'w', function (err, _file) {
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    resolve(true);
                                }
                            });
                        }
                    });
                })];
        });
    });
}
/**
 * @description return the error to mainThread throght postMessage
 * @param error catched error in fs function
 */
function handleFsError(error) {
    node_worker_threads_1.parentPort === null || node_worker_threads_1.parentPort === void 0 ? void 0 : node_worker_threads_1.parentPort.emit('messageerror', error);
}
function readLines(inputFilePath, lineCounts) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function () {
        var file, res, _b, _c, line, e_1_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    file = fsP.open(inputFilePath);
                    res = [];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 7, 8, 13]);
                    return [4 /*yield*/, file];
                case 2:
                    _b = __asyncValues.apply(void 0, [(_d.sent()).readLines()]);
                    _d.label = 3;
                case 3: return [4 /*yield*/, _b.next()];
                case 4:
                    if (!(_c = _d.sent(), !_c.done)) return [3 /*break*/, 6];
                    line = _c.value;
                    res.push(line);
                    _d.label = 5;
                case 5: return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_1_1 = _d.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _d.trys.push([8, , 11, 12]);
                    if (!(_c && !_c.done && (_a = _b["return"]))) return [3 /*break*/, 10];
                    return [4 /*yield*/, _a.call(_b)];
                case 9:
                    _d.sent();
                    _d.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13: return [2 /*return*/, res];
            }
        });
    });
}
function readLastLines(inputFilePath, maxLineCount, encoding) {
    if (maxLineCount === void 0) { maxLineCount = 200; }
    if (encoding === void 0) { encoding = "utf8"; }
    return __awaiter(this, void 0, void 0, function () {
        var _a, stat, file, chars, lineCount, lines, nextCharacter;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // 检查文件是否存在
                    if (!fs.existsSync(inputFilePath))
                        throw new Error("File ".concat(inputFilePath, " does not exist."));
                    return [4 /*yield*/, Promise.all([
                            new Promise(function (resolve, reject) {
                                return fs.stat(inputFilePath, function (err, stat) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        resolve(stat);
                                    }
                                });
                            }),
                            new Promise(function (resolve, reject) {
                                return fs.open(inputFilePath, "r", function (err, file) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        resolve(file);
                                    }
                                });
                            }),
                        ])];
                case 1:
                    _a = _b.sent(), stat = _a[0], file = _a[1];
                    chars = 0;
                    lineCount = 0;
                    lines = "";
                    _b.label = 2;
                case 2:
                    if (!(lines.length < stat.size && lineCount < maxLineCount)) return [3 /*break*/, 4];
                    return [4 /*yield*/, readPreviousChar(stat, file, chars, encoding)];
                case 3:
                    nextCharacter = _b.sent();
                    lines = nextCharacter + lines;
                    // 检查是否遇到换行符，并增加行数计数器
                    if (NEW_LINE_CHARACTERS.includes(nextCharacter) && lines.length > 1) {
                        lineCount++;
                    }
                    chars++;
                    // 如果 `lines` 的长度超过文件大小，则截取末尾部分以保持与文件大小相同的长度
                    if (lines.length > stat.size) {
                        lines = lines.substring(lines.length - stat.size);
                    }
                    return [3 /*break*/, 2];
                case 4:
                    // 如果 `lines` 的第一个字符是换行符，则移除该字符
                    if (NEW_LINE_CHARACTERS.includes(lines.substring(0, 1))) {
                        lines = lines.substring(1);
                    }
                    // 关闭文件句柄
                    fs.closeSync(file);
                    return [2 /*return*/, lines];
            }
        });
    });
}
function readPreviousChar(stat, file, currentCharacterCount, encoding) {
    if (encoding === void 0) { encoding = "utf-8"; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    fs.read(file, Buffer.alloc(1), 0, 1, stat.size - 1 - currentCharacterCount, function (err, bytesRead, buffer) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(buffer.toString(encoding));
                        }
                    });
                })];
        });
    });
}
function readJSON(file) {
    return __awaiter(this, void 0, void 0, function () {
        var jsonString, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fsP.readFile(file, { encoding: 'utf-8' })];
                case 1:
                    jsonString = _a.sent();
                    return [2 /*return*/, JSON.parse(jsonString)];
                case 2:
                    err_1 = _a.sent();
                    handleFsError(err_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
module.exports;
