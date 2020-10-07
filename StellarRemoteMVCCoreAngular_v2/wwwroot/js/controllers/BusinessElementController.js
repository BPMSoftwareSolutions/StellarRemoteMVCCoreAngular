var mainApp = angular.module('DynamicBusinessModelWeb.BusinessElementController', [], function ($compileProvider) {
    // configure new 'compile' directive by passing a directive
    // factory function. The factory function injects the '$compile'
    $compileProvider.directive('compile', function ($compile) {
        // directive factory creates a link function
        return function (scope, element, attrs) {
            scope.$watch(
              function (scope) {
                  // watch the 'compile' expression for changes
                  return scope.$eval(attrs.compile);
              },
              function (value) {
                  if (value) {
                      // when the 'compile' expression changes
                      // assign it into the current DOM
                      element.html(value);

                      // compile the new DOM and link it to the current
                      // scope.
                      // NOTE: we only compile .childNodes so that
                      // we don't get into infinite loop compiling ourselves
                      $compile(element.contents())(scope);
                  }
              }
            );
        };
    });
});
mainApp.controller('BusinessElementCtrl', function ($scope, $http, $window) {
        $scope.heading = "Dynamic Business Model";
        $scope.loading = true;
        $scope.MouseOverMenu = {};
        $scope.LeftPosition = 0;

        $scope.states = {
            showSearchFieldForm: false
        };

        $http.get('/BusinessElement/BusinessElementVM').then(function (response) {
            $scope.Model = response.data;
            $scope.loading = false;
        });

        $scope.updateDocElementStyle = function (element, val) {
            e = document.getElementById(element);
            if (e)
                e.style = val;
        }

        $scope.updateDocElementStyle("SubItems", "display:block");

        $scope.setMouseOverMenu = function (menu) {
            $scope.MouseOverMenu = menu;
            var elem = document.getElementById("mnu" + menu.Name);
            var rect = elem.getBoundingClientRect();
            $scope.LeftPosition = rect.left;
        }

        $scope.resetMouseOverMenu = function () {
            $scope.MouseOverMenu = {};
        }

        //$scope.loading = true;
        //$http.post('/UserBusinessModel/GetHtmlDisplay').then(function (response) {
        //    $scope.html = response.data;
        //    $scope.loading = false;
        //});

        $scope.showFields = function (displayMode) {
            $http.post('/UserBusinessModel/ShowFields', { displayMode: displayMode }).then(function (response) {
                $scope.Model.ColumnViewFields = response.data;
                $scope.Model.DisplayMode = displayMode;
            });
        };

        $scope.viewObjects = function (id) {
            $scope.loading = true;
            $window.location.href = $window.location.protocol + "//" + $window.location.host + "/BusinessElement/ViewObjects/" + id;
        }

        $scope.editObject = function (id) {
            $scope.loading = true;
            $window.location.href = $window.location.protocol + "//" + $window.location.host + "/BusinessElement/Edit/" + id;
        }

        $scope.createObject = function (id) {
            $scope.loading = true;
            $window.location.href = $window.location.protocol + "//" + $window.location.host + "/BusinessElement/NewObject/" + id;
        }

        $scope.createElement = function () {
            $scope.loading = true;
            $window.location.href = $window.location.protocol + "//" + $window.location.host + "/BusinessElement/Create";
        }

        $scope.updateObject = function () {
            $scope.loading = true;
            $http.post('/UserBusinessModel/Update', { activeObject: $scope.Model.CurrentPath.ActiveObject }).then(function (response) {
                var cache = response.data;
                $window.location.href = $window.location.protocol + "//" + $window.location.host + "/UserBusinessModel/" + cache.ViewName + "/" + cache.ID;
            });
        };

        $scope.insertObject = function (nextDisplayMode) {
            $scope.checkIfAllFieldsCompleted();
            if ($scope.requiredFieldsCompleted == true) {
                $scope.loading = true;
                $scope.Model.CurrentPath.ActiveObject = response.data;
                $http.post('/UserBusinessModel/Insert', { activeObject: $scope.Model.CurrentPath.ActiveObject, nextDisplayMode: nextDisplayMode }).then(function (response) {
                    var cache = response.data;
                    $window.location.href = $window.location.protocol + "//" + $window.location.host + "/UserBusinessModel";
                });
            }
        };

        $scope.navigate = function (menuItem) {
            $scope.loading = true;
            $window.location.href = $window.location.protocol + "//" + $window.location.host + "/" + menuItem.ControllerName + "/" + menuItem.ActionName;
        }
    });
