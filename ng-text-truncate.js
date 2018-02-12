(function() {
    'use strict';

    angular.module('ngTextTruncate', [])
        .directive("ngTextTruncate", ["$compile", "ValidationServices", "CharBasedTruncation", "WordBasedTruncation",
            function($compile, ValidationServices, CharBasedTruncation, WordBasedTruncation) {
                return {
                    restrict: "A",
                    scope: {
                        text: "=ngTextTruncate",
                        charsThreshold: "@ngTtCharsThreshold",
                        wordsThreshold: "@ngTtWordsThreshold",
                        customMoreLabel: "@ngTtMoreLabel",
                        customLessLabel: "@ngTtLessLabel",
                        trailingSpace: "@ngTtTrailingSpace"
                    },
                    controller: function($scope, $element, $attrs) {
                        $scope.toggleShow = function() {
                            $scope.open = !$scope.open;
                        };

                        $scope.useToggling = $attrs.ngTtNoToggling === undefined;
                        $scope.trailingSpace = Boolean($scope.trailingSpace);
                    },
                    link: function($scope, $element, $attrs) {
                        $scope.open = false;

                        ValidationServices.failIfWrongThresholdConfig($scope.charsThreshold, $scope.wordsThreshold);

                        var CHARS_THRESHOLD = parseInt($scope.charsThreshold);
                        var WORDS_THRESHOLD = parseInt($scope.wordsThreshold);

                        $scope.$watch("text", function() {
                            $element.empty();

                            if (CHARS_THRESHOLD) {
                                if ($scope.text && CharBasedTruncation.truncationApplies($scope, CHARS_THRESHOLD)) {
                                    CharBasedTruncation.applyTruncation(CHARS_THRESHOLD, $scope, $element);

                                } else {
                                    $element.append($scope.text);
                                }

                            } else {

                                if ($scope.text && WordBasedTruncation.truncationApplies($scope, WORDS_THRESHOLD)) {
                                    WordBasedTruncation.applyTruncation(WORDS_THRESHOLD, $scope, $element);

                                } else {
                                    $element.append($scope.text);
                                }

                            }
                        });
                    }
                };
            }
        ])

    .factory("ValidationServices", function() {
        return {
            failIfWrongThresholdConfig: function(firstThreshold, secondThreshold) {
                if ((!firstThreshold && !secondThreshold) || (firstThreshold && secondThreshold)) {
                    throw "You must specify one, and only one, type of threshold (chars or words)";
                }
            }
        };
    })

    .factory("CharBasedTruncation", ["$compile", function($compile) {
        return {
            truncationApplies: function($scope, threshold) {
                return $scope.text.length > threshold;
            },

            applyTruncation: function(threshold, $scope, $element) {
                if ($scope.useToggling) {
                    var el;

                    el = angular.element(
                        "<span " +
                        "class='btn-link ngTruncateToggleText' " +
                        "ng-click='toggleShow()' " +
                        "ng-show='!open'> " +
                        $scope.text.substr(0, threshold) +
                        "<span ng-show='!open'>...</span>");

                    $compile(el)($scope);
                    $element.append(el);
                    var trailingSpace = $scope.trailingSpace ? '&nbsp;' : '';

                    el = angular.element(
                        "<span " +
                        "class='btn-link ngTruncateToggleText' " +
                        "ng-click='toggleShow()' " +
                        "ng-show='open'> " +
                        $scope.text +
                        trailingSpace +
                        "</span>");

                    $compile(el)($scope);
                    $element.append(el);

                } else {
                    $element.append($scope.text.substr(0, threshold) + "...");

                }
            }
        };
    }])

    .factory("WordBasedTruncation", ["$compile", function($compile) {
        return {
            truncationApplies: function($scope, threshold) {
                return $scope.text.split(" ").length > threshold;
            },

            applyTruncation: function(threshold, $scope, $element) {
                var splitText = $scope.text.split(" ");
                if ($scope.useToggling) {
                    var el = angular.element("<span>" +
                        splitText.slice(0, threshold).join(" ") + " " +
                        "<span ng-show='!open'>...</span>" +
                        "<span class='btn-link ngTruncateToggleText' " +
                        "ng-click='toggleShow()'" +
                        "ng-show='!open'>" +
                        " " + ($scope.customMoreLabel ? $scope.customMoreLabel : "More") +
                        "</span>" +
                        "<span ng-show='open'>" +
                        splitText.slice(threshold, splitText.length).join(" ") +
                        "<span class='btn-link ngTruncateToggleText'" +
                        "ng-click='toggleShow()'>" +
                        " " + ($scope.customLessLabel ? $scope.customLessLabel : "Less") +
                        "</span>" +
                        "</span>" +
                        "</span>");
                    $compile(el)($scope);
                    $element.append(el);

                } else {
                    $element.append(splitText.slice(0, threshold).join(" ") + "...");
                }
            }
        };
    }]);

}());