cat canvas-event-js/class.js canvas-event-js/events.js canvas-event-js/shapes.js | uglifyjs -v > ../js/canvas-event.min.js
cat utils.js jigsaw-objects.js jigsaw-controller.js jigsaw-ui.js jigsaw-events.js modal-window.js loader.js | uglifyjs -v > ../js/canvas-puzzle.min.js
uglifyjs jigsaw-objects-ie.js > ../js/canvas-puzzle.ie.min.js
