"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/toggle-selection";
exports.ids = ["vendor-chunks/toggle-selection"];
exports.modules = {

/***/ "(ssr)/./node_modules/toggle-selection/index.js":
/*!************************************************!*\
  !*** ./node_modules/toggle-selection/index.js ***!
  \************************************************/
/***/ ((module) => {

eval("\nmodule.exports = function() {\n    var selection = document.getSelection();\n    if (!selection.rangeCount) {\n        return function() {};\n    }\n    var active = document.activeElement;\n    var ranges = [];\n    for(var i = 0; i < selection.rangeCount; i++){\n        ranges.push(selection.getRangeAt(i));\n    }\n    switch(active.tagName.toUpperCase()){\n        case \"INPUT\":\n        case \"TEXTAREA\":\n            active.blur();\n            break;\n        default:\n            active = null;\n            break;\n    }\n    selection.removeAllRanges();\n    return function() {\n        selection.type === \"Caret\" && selection.removeAllRanges();\n        if (!selection.rangeCount) {\n            ranges.forEach(function(range) {\n                selection.addRange(range);\n            });\n        }\n        active && active.focus();\n    };\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvdG9nZ2xlLXNlbGVjdGlvbi9pbmRleC5qcyIsIm1hcHBpbmdzIjoiO0FBQ0FBLE9BQU9DLE9BQU8sR0FBRztJQUNmLElBQUlDLFlBQVlDLFNBQVNDLFlBQVk7SUFDckMsSUFBSSxDQUFDRixVQUFVRyxVQUFVLEVBQUU7UUFDekIsT0FBTyxZQUFhO0lBQ3RCO0lBQ0EsSUFBSUMsU0FBU0gsU0FBU0ksYUFBYTtJQUVuQyxJQUFJQyxTQUFTLEVBQUU7SUFDZixJQUFLLElBQUlDLElBQUksR0FBR0EsSUFBSVAsVUFBVUcsVUFBVSxFQUFFSSxJQUFLO1FBQzdDRCxPQUFPRSxJQUFJLENBQUNSLFVBQVVTLFVBQVUsQ0FBQ0Y7SUFDbkM7SUFFQSxPQUFRSCxPQUFPTSxPQUFPLENBQUNDLFdBQVc7UUFDaEMsS0FBSztRQUNMLEtBQUs7WUFDSFAsT0FBT1EsSUFBSTtZQUNYO1FBRUY7WUFDRVIsU0FBUztZQUNUO0lBQ0o7SUFFQUosVUFBVWEsZUFBZTtJQUN6QixPQUFPO1FBQ0xiLFVBQVVjLElBQUksS0FBSyxXQUNuQmQsVUFBVWEsZUFBZTtRQUV6QixJQUFJLENBQUNiLFVBQVVHLFVBQVUsRUFBRTtZQUN6QkcsT0FBT1MsT0FBTyxDQUFDLFNBQVNDLEtBQUs7Z0JBQzNCaEIsVUFBVWlCLFFBQVEsQ0FBQ0Q7WUFDckI7UUFDRjtRQUVBWixVQUNBQSxPQUFPYyxLQUFLO0lBQ2Q7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL2F1dG9tYXRpemF0aW9uLy4vbm9kZV9tb2R1bGVzL3RvZ2dsZS1zZWxlY3Rpb24vaW5kZXguanM/NWJhZSJdLCJzb3VyY2VzQ29udGVudCI6WyJcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIHNlbGVjdGlvbiA9IGRvY3VtZW50LmdldFNlbGVjdGlvbigpO1xyXG4gIGlmICghc2VsZWN0aW9uLnJhbmdlQ291bnQpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7fTtcclxuICB9XHJcbiAgdmFyIGFjdGl2ZSA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XHJcblxyXG4gIHZhciByYW5nZXMgPSBbXTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGVjdGlvbi5yYW5nZUNvdW50OyBpKyspIHtcclxuICAgIHJhbmdlcy5wdXNoKHNlbGVjdGlvbi5nZXRSYW5nZUF0KGkpKTtcclxuICB9XHJcblxyXG4gIHN3aXRjaCAoYWN0aXZlLnRhZ05hbWUudG9VcHBlckNhc2UoKSkgeyAvLyAudG9VcHBlckNhc2UgaGFuZGxlcyBYSFRNTFxyXG4gICAgY2FzZSAnSU5QVVQnOlxyXG4gICAgY2FzZSAnVEVYVEFSRUEnOlxyXG4gICAgICBhY3RpdmUuYmx1cigpO1xyXG4gICAgICBicmVhaztcclxuXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICBhY3RpdmUgPSBudWxsO1xyXG4gICAgICBicmVhaztcclxuICB9XHJcblxyXG4gIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcclxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG4gICAgc2VsZWN0aW9uLnR5cGUgPT09ICdDYXJldCcgJiZcclxuICAgIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcclxuXHJcbiAgICBpZiAoIXNlbGVjdGlvbi5yYW5nZUNvdW50KSB7XHJcbiAgICAgIHJhbmdlcy5mb3JFYWNoKGZ1bmN0aW9uKHJhbmdlKSB7XHJcbiAgICAgICAgc2VsZWN0aW9uLmFkZFJhbmdlKHJhbmdlKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYWN0aXZlICYmXHJcbiAgICBhY3RpdmUuZm9jdXMoKTtcclxuICB9O1xyXG59O1xyXG4iXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsInNlbGVjdGlvbiIsImRvY3VtZW50IiwiZ2V0U2VsZWN0aW9uIiwicmFuZ2VDb3VudCIsImFjdGl2ZSIsImFjdGl2ZUVsZW1lbnQiLCJyYW5nZXMiLCJpIiwicHVzaCIsImdldFJhbmdlQXQiLCJ0YWdOYW1lIiwidG9VcHBlckNhc2UiLCJibHVyIiwicmVtb3ZlQWxsUmFuZ2VzIiwidHlwZSIsImZvckVhY2giLCJyYW5nZSIsImFkZFJhbmdlIiwiZm9jdXMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/toggle-selection/index.js\n");

/***/ })

};
;