const fs = require('fs');
const path = require('path');

const async = require('async');

fs.readdir(path.join(__dirname, '../', 'images'), function (err, items) {
    async.each(items, function (item, next) {
            if (item === ".DS_Store") {
                return next(null);
            }

            if (item === "couch") {
                BuildData(item, next);
            }
            else {
                next(null);
            }
        },
        function () {
            console.log("Done!");
        }
    );
});

function BuildData(folder, callback) {
    var js = 'choices.' + folder + '= {};';
    var css = '';

    fs.readdir(path.join(__dirname, '../', 'images', folder), function (err, items) {
        async.eachSeries(
            items,
            function (item, next) {
                var name = item.substring(0, item.length - 4);

                js += 'choices.' + folder + '["' + name + '"] = {';
                js += ' css: "' + folder + ' ' + folder + '--' + name + '",';
                js += ' thumb: "/images/' + folder + '/' + item + '"';
                js += '};';

                css += '&.' + folder + '--' + name + '{\r\n';
                css += ' background-image: url("/images/' + folder + '/' + item + '")\r\n';
                css += '}\r\n\r\n';

                next(null);
            },
            function () {
                async.waterfall(
                    [
                        function LoadSCSS(next) {
                            fs.readFile(path.join(__dirname, '../', 'sass', 'components', '_' + folder + '.scss'), 'utf8', next);
                        },
                        function ReplaceAutoMarkers(content, next) {
                            var start = content.indexOf('/** AUTO **/');
                            var end = content.indexOf('/** AUTOEND **/');

                            content = content.substr(0, start + 12) + '\r\n' + css + content.substr(end);

                            next(null, content);
                        },
                        function WriteSCSS(content, next) {
                            fs.writeFile(path.join(__dirname, '../', 'sass', 'components', '_' + folder + '.scss'), content, next);
                        }
                    ],
                    function () {
                        callback(null);
                    }
                )
            }
        );
    });
}