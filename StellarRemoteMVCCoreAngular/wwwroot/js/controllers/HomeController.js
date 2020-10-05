var mainApp = angular.module('app', [], function ($compileProvider) {
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
mainApp.controller('HomeController', function ($scope, $http, $window, $document, $timeout) {
    $scope.heading = "Stellar Remote";
    $scope.loading = false;
    $scope.NavHtml = "";
    $scope.MouseOverMenu = {};
    $scope.LeftPosition = 0;
    $scope.testvalue = 'My Test Value';

    $http.get('/home/homeVM').then(function (response) {
        $scope.Model = response.data;
    });

    //$scope.updateDocElementStyle = function (element, val) {
    //    e = document.getElementById(element);
    //    if (e)
    //        e.style = val;
    //};

    //$scope.updateDocElementStyle("SubItems", "display:block");

    //$scope.manageAccount = function () {
    //    var elem = document.getElementById("manage_account");
    //    if (typeof elem.onclick == "function") {
    //        elem.onclick.apply(elem);
    //    }
    //};

    //$scope.setMouseOverMenu = function (menu) {
    //    $scope.MouseOverMenu = menu;
    //    var elem = document.getElementById("mnu" + menu.Name);
    //    var rect = elem.getBoundingClientRect();
    //    $scope.LeftPosition = rect.left;
    //};

    //$scope.resetMouseOverMenu = function () {
    //    $scope.MouseOverMenu = {};
    //};

    //$scope.logoff = function () {
    //    document.getElementById('logoutForm').submit()
    //};

    //$(document).ready(function () {
    //    $('.dropdown-submenu button').on("mouseover", function (e) {
    //        $(this).next('ul').toggle();
    //        e.stopPropagation();
    //        e.preventDefault();
    //    });
    //});

    //$scope.loadBusiness = function () {
    //    $scope.loading = true;
    //    $window.location.href = $window.location.protocol + "//" + $window.location.host + "/UserBusinessModel";
    //};

    //$scope.navigate = function (menuItem) {
    //    if (menuItem.Name == "Contact")
    //        $scope.loading = true;
    //    $window.location.href = $window.location.protocol + "//" + $window.location.host + "/" + menuItem.ControllerName + "/" + menuItem.ActionName;
    //};
});
angular.module('app').directive('docelementstyle', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('docelementstyle');
            }, function (val) {
                if (val) {
                    scope.updateDocElementStyle(val, element.attr('value'));
                }
            }, true);
        }
    };
});
