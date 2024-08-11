"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/has-flag";
exports.ids = ["vendor-chunks/has-flag"];
exports.modules = {

/***/ "(ssr)/./node_modules/has-flag/index.js":
/*!****************************************!*\
  !*** ./node_modules/has-flag/index.js ***!
  \****************************************/
/***/ ((module) => {

eval("\nmodule.exports = (flag, argv)=>{\n    argv = argv || process.argv;\n    const prefix = flag.startsWith(\"-\") ? \"\" : flag.length === 1 ? \"-\" : \"--\";\n    const pos = argv.indexOf(prefix + flag);\n    const terminatorPos = argv.indexOf(\"--\");\n    return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvaGFzLWZsYWcvaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQUE7QUFDQUEsT0FBT0MsT0FBTyxHQUFHLENBQUNDLE1BQU1DO0lBQ3ZCQSxPQUFPQSxRQUFRQyxRQUFRRCxJQUFJO0lBQzNCLE1BQU1FLFNBQVNILEtBQUtJLFVBQVUsQ0FBQyxPQUFPLEtBQU1KLEtBQUtLLE1BQU0sS0FBSyxJQUFJLE1BQU07SUFDdEUsTUFBTUMsTUFBTUwsS0FBS00sT0FBTyxDQUFDSixTQUFTSDtJQUNsQyxNQUFNUSxnQkFBZ0JQLEtBQUtNLE9BQU8sQ0FBQztJQUNuQyxPQUFPRCxRQUFRLENBQUMsS0FBTUUsQ0FBQUEsa0JBQWtCLENBQUMsSUFBSSxPQUFPRixNQUFNRSxhQUFZO0FBQ3ZFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYXV0b21hdGl6YXRpb24vLi9ub2RlX21vZHVsZXMvaGFzLWZsYWcvaW5kZXguanM/ZjNmNiJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcbm1vZHVsZS5leHBvcnRzID0gKGZsYWcsIGFyZ3YpID0+IHtcclxuXHRhcmd2ID0gYXJndiB8fCBwcm9jZXNzLmFyZ3Y7XHJcblx0Y29uc3QgcHJlZml4ID0gZmxhZy5zdGFydHNXaXRoKCctJykgPyAnJyA6IChmbGFnLmxlbmd0aCA9PT0gMSA/ICctJyA6ICctLScpO1xyXG5cdGNvbnN0IHBvcyA9IGFyZ3YuaW5kZXhPZihwcmVmaXggKyBmbGFnKTtcclxuXHRjb25zdCB0ZXJtaW5hdG9yUG9zID0gYXJndi5pbmRleE9mKCctLScpO1xyXG5cdHJldHVybiBwb3MgIT09IC0xICYmICh0ZXJtaW5hdG9yUG9zID09PSAtMSA/IHRydWUgOiBwb3MgPCB0ZXJtaW5hdG9yUG9zKTtcclxufTtcclxuIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJmbGFnIiwiYXJndiIsInByb2Nlc3MiLCJwcmVmaXgiLCJzdGFydHNXaXRoIiwibGVuZ3RoIiwicG9zIiwiaW5kZXhPZiIsInRlcm1pbmF0b3JQb3MiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/has-flag/index.js\n");

/***/ })

};
;