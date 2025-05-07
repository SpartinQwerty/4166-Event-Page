self.__BUILD_MANIFEST = {
  "polyfillFiles": [
    "static/chunks/polyfills.js"
  ],
  "devFiles": [
    "static/chunks/react-refresh.js"
  ],
  "ampDevFiles": [],
  "lowPriorityFiles": [],
  "rootMainFiles": [],
  "pages": {
    "/": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/index.js"
    ],
    "/_app": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_app.js"
    ],
    "/_error": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_error.js"
    ],
    "/admin": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/admin.js"
    ],
    "/admin/events": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/admin/events.js"
    ],
    "/admin/games": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/admin/games.js"
    ],
    "/admin/locations": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/admin/locations.js"
    ],
    "/auth/signin": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/auth/signin.js"
    ],
    "/events": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/events.js"
    ],
    "/events/[id]": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/events/[id].js"
    ],
    "/events/create": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/events/create.js"
    ],
    "/events/nearby": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/events/nearby.js"
    ],
    "/events/popular": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/events/popular.js"
    ],
    "/events/today": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/events/today.js"
    ],
    "/profile": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/profile.js"
    ]
  },
  "ampFirstPages": []
};
self.__BUILD_MANIFEST.lowPriorityFiles = [
"/static/" + process.env.__NEXT_BUILD_ID + "/_buildManifest.js",
,"/static/" + process.env.__NEXT_BUILD_ID + "/_ssgManifest.js",

];