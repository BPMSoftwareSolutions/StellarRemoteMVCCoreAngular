var mainApp = angular.module('DynamicBusinessModelWeb.BusinessObjectController', ['ngMap'], function ($compileProvider) {
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
mainApp.controller('BusinessObjectCtrl', function ($scope, $http, $window, $document, $timeout, $interval) {
    $scope.loading = true;
    $scope.loadingRelated = false;
    $scope.MouseOverMenu = {};
    $scope.LeftPosition = 0;

    $http.get('/BusinessObject/BusinessObjectVM').then(function (response) {
        $scope.Model = response.data;
        $scope.imageCycle = 0;
        $scope.imageCycleTimer = {};
        $scope.Images = [];
        $scope.BackgroundImage = "";
        $scope.data = {};
        $scope.heading = "Available Business Objects";
        $scope.backLabel = "<< Back";
        $scope.SaveAndNew = "Save & New";
        $scope.dragFieldId = "";
        $scope.destinationFieldId = "";
        $scope.fileName = "";
        $scope.SearchCriteria = {};
        $scope.SearchFieldData = {};
        $scope.ViewField = {};
        $scope.currentPage = $scope.Model.CurrentPage;
        $scope.DataSourceCriteria = [];
        $scope.DataSourceOrderBy = [];
        $scope.DataSourceGroupBy = [];
        $scope.DataSourceSelect = [];
        $scope.DataSourceJoin = [];
        $scope.DataSource = [];
        $scope.DataSourceLoadStatus = [];
        $scope.DataSourceParamStatus = [];
        $scope.DataSourceModel = [];
        $scope.DataSourceParameters = [];
        $scope.DataSourceColumns = [];
        $scope.DataSourceImages = [];
        $scope.DataSourceMapMarkers = [];
        $scope.DataSourceFlag = [];
        $scope.DataSourceObject = [];
        $scope.dsDragField = 0;
        $scope.dsDragReference = "";
        $scope.MapMarkers = [];
        $scope.ChartOptions = [];
        $scope.ChartElements = [];
        $scope.ChartColumns = [];
        $scope.ChartRows = [];
        $scope.DisplayFlagParameters = [];
        $scope.ChartToLoad = "";
        $scope.multipleDeleteLabel = "Turn on Delete Multiple";
        $scope.LastMapMarker = "[42.12, 83.17";
        //$scope.html = "{{Model.BusinessElement.Name}}";
        $scope.deleteOn = false;
        $scope.requiredFieldsCompleted = false;
        $scope.hash = $window.location.hash;
        $scope.states = {
            showSearchFieldForm: false,
            displayType: "DisplayObjects"
        };
        $scope.CustomDisplayFlag = "";
        $scope.TempFileData = "";
        document.documentElement.style.setProperty('padding', '60px');
        document.documentElement.style.setProperty('padding-top', '20px');
        $scope.OperatorTypes = [
            { value: "", name: "" },
            { value: "=", name: "=" },
            { value: ">", name: ">" },
            { value: "<", name: "<" },
            { value: "contains", name: "contains" },
            { value: "startswith", name: "starts with" },
            { value: "endswith", name: "ends with" }
        ];
        $scope.SlideFrequency = 2000;
        $scope.SlideIndex = 0;
        $scope.SlideTimerStarted = false;

        $scope.setMouseOverMenu = function (menu) {
            $scope.MouseOverMenu = menu;
            var elem = document.getElementById("mnu" + menu.Name);
            var rect = elem.getBoundingClientRect();
            $scope.LeftPosition = rect.left;
        }

        $scope.resetMouseOverMenu = function () {
            $scope.MouseOverMenu = {};
        }

        $scope.getMap = function() {
            var myLatLng = { lat: 42.3601, lng: -71.0589 };
            
            var element = document.getElementById('map');
            if (element) {
                var map = new google.maps.Map(element, {
                    zoom: 13,
                    center: myLatLng
                });
            }
        }
        $scope.getMap();

        $scope.setPersistentData = function(key, value) {
            $http.post('/BusinessObject/SetPersistentData', {
                key: key,
                value: value
            }).then(function (response) {
                $scope.Model.PersistentData = response.data;
            });
        }

        $scope.setDefaultValue = function (id, value) {
            document.getElementById(id).defaultValue = value;
        }

        $scope.persistentDataExists = function (key) {
            $http.post('/BusinessObject/PersistentDataExists', {
                key: key
            }).then(function (response) {
                return response.data;
            });
        }

        $scope.setPersistentDataSet = function (key, dataset) {
            $http.post('/BusinessObject/SetPersistentDataSet', {
                key: key,
                dataset: dataset
            }).then(function (response) {
                $scope.Model.PersistentDataSet = response.data;
            });
        }

        $scope.persistentDataSetExists = function (key) {
            $http.post('/BusinessObject/PersistentDataSetExists', {
                key: key
            }).then(function (response) {
                return response.data;
            });
        }

        $scope.clickElement = function (id) {
            document.getElementById(id).click();
        }

        $scope.setActiveObjectValue = function (key, value) {
            $scope.Model.CurrentPath.ActiveObject[key] = value;
        }

        $scope.initChart = function(referenceName, element, type, title, width, height) {
            if (!$scope.ChartElements.hasOwnProperty(referenceName)) {
                $scope.ChartElements.push(referenceName);
            }
            if (!$scope.ChartOptions.hasOwnProperty(referenceName)) {
                $scope.ChartOptions.push(referenceName);
            }
            if (!$scope.ChartRows.hasOwnProperty(referenceName)) {
                $scope.ChartRows.push(referenceName);
            }
            if (!$scope.ChartColumns.hasOwnProperty(referenceName)) {
                $scope.ChartColumns.push(referenceName);
            }

            if (!type) {
                type = 'Column';
            }
            
            $scope.ChartElements[referenceName] = {
                Name: element,
                Type: type
            };
            $scope.ChartRows[referenceName] = [];
            $scope.ChartColumns[referenceName] = [];
            $scope.ChartOptions[referenceName] = {
                'title': title,
                'width': width,
                'height': height
            };
        };

        $scope.addChartColumn = function (referenceName, columnName, type) {
            var column = {
                Name: columnName, Type: type
            };
            $scope.ChartColumns[referenceName].push(column);
        };

        $scope.addChartRow = function(referenceName, rowData) {
            $scope.ChartRows[referenceName].push(rowData);
        }

        $scope.loadCharts = function () {
            $scope.ChartToLoad = "";
            // Load the Visualization API and the corechart package.
            google.charts.load('current', { 'packages': ['corechart'] });

            // Set a callback to run when the Google Visualization API is loaded.
            google.charts.setOnLoadCallback(drawChart);
        }

        $scope.returnArray = function (arrayData) {
            return arrayData;
        }

        $scope.parseFloat = function(val) {
            return parseFloat(val);
        };

        // Callback that creates and populates a data table,
        // instantiates the chart, passes in the data and
        // draws it.
        $scope.drawChart = function (referenceName) {
            // Create the data table.
            var data = new google.visualization.DataTable();
            var i = 0;

            // Create the data columns
            for (i = 0; i < $scope.ChartColumns[referenceName].length; i++) {
                var column = $scope.ChartColumns[referenceName][i];
                data.addColumn(column['Type'], column['Name']);
            }

            // Create the rows to represent the data
            for (i = 0; i < $scope.ChartRows[referenceName].length; i++) {
                var row = $scope.ChartRows[referenceName][i];
                data.addRow(row);
            }

            // Set chart options
            var options = $scope.ChartOptions[referenceName];
            var chartElement = $scope.ChartElements[referenceName];
            var element = document.getElementById(chartElement.Name);

            if (element) {
                // Instantiate and draw our chart, passing in some options.
                var chart;
                if (chartElement.Type == 'Column')
                    chart = new google.visualization.ColumnChart(element);
                if (chartElement.Type == 'Pie')
                    chart = new google.visualization.PieChart(element);
                if (chartElement.Type == 'Line')
                    chart = new google.visualization.LineChart(element);

                chart.draw(data, options);
            }
        };

        function drawChart() {
            var i = 0;
            for (i = 0; i < $scope.ChartElements.length; i++) {
                $scope.drawChart($scope.ChartElements[i]);
            }
        }

        function carousel() {
            var i;
            var x = document.getElementsByClassName("slideshow");
            if (x && x.length > 0) {
                for (i = 0; i < x.length; i++) {
                    x[i].style.display = "none";
                }
                $scope.SlideIndex++;
                if ($scope.SlideIndex > x.length) { $scope.SlideIndex = 1; }
                x[$scope.SlideIndex - 1].style.display = "block";
            }
            if ($scope.SlideTimerStarted == false) {
                $scope.SlideTimerHandle = $interval(carousel, $scope.SlideFrequency); // Change image every 2 seconds
                $scope.SlideTimerStarted = true;
            }
        }

        $scope.setObjectValue = function (obj, field, value) {
            $scope.Model.CurrentPath.ActiveObject[field] = value;
        }

        $scope.getPageArray = function (num) {
            return new Array(num);
        }

        $scope.initSlideShow = function (cycleIndex, cycleFrequency) {
            $scope.SlideFrequency = cycleFrequency;
            $scope.SlideIndex = cycleIndex;
            carousel();
        }

        $scope.stopSlideShow = function () {
            if ($scope.SlideTimerStarted) {
                $interval.cancel($scope.SlideTimerHandle);
            }
        }

        $scope.convertToDate = function (date) {
            return new Date(date);
        }

        $http.post('/BusinessObject/GetHtmlDisplay').then(function (response) {
            $scope.html = response.data;
        });

        $scope.updateBackgroundImage = function (e, url) {
            element = document.getElementById(e);
            if (element)
                element.style = 'background-image:url(' + url + ');';
        }

        $scope.updateDocElementStyle = function (element, val) {
            e = document.getElementById(element);
            if (e)
                e.style = val;
        }

        $scope.updateDocElementStyle("SubItems", "display:block");

        $scope.setDisplayFlag = function (value) {
            $scope.CustomDisplayFlag = value;
        }

        $scope.setDisplayFlagWithParameters = function (value, parameters) {
            $scope.CustomDisplayFlag = value;
            $scope.DisplayFlagParameters = parameters;
        }

        $scope.getBackgroundImageSource = function () {
            if ($scope.Model.BackgroundImage && $scope.Model.BackgroundImage.length > 0) {
                $http.post('/BusinessObject/GetImageSource', { id: $scope.Model.BackgroundImage }).then(function (response) {
                    $scope.updateBackgroundImage('elementbody', response.data['Image']);
                });
            }
        };

        $scope.initDataSource = function (referenceName) {
            if (!$scope.DataSourceCriteria.hasOwnProperty(referenceName)) {
                $scope.DataSourceCriteria.push(referenceName);
            }
            if (!$scope.DataSourceOrderBy.hasOwnProperty(referenceName)) {
                $scope.DataSourceOrderBy.push(referenceName);
            }
            if (!$scope.DataSourceGroupBy.hasOwnProperty(referenceName)) {
                $scope.DataSourceGroupBy.push(referenceName);
            }
            if (!$scope.DataSourceSelect.hasOwnProperty(referenceName)) {
                $scope.DataSourceSelect.push(referenceName);
            }
            if (!$scope.DataSourceJoin.hasOwnProperty(referenceName)) {
                $scope.DataSourceJoin.push(referenceName);
            }
            if (!$scope.DataSource.hasOwnProperty(referenceName)) {
                $scope.DataSource.push(referenceName);
            }
            if (!$scope.DataSourceImages.hasOwnProperty(referenceName)) {
                $scope.DataSourceImages.push(referenceName);
            }
            if (!$scope.DataSourceMapMarkers.hasOwnProperty(referenceName)) {
                $scope.DataSourceMapMarkers.push(referenceName);
            }
            if (!$scope.DataSourceParameters.hasOwnProperty(referenceName)) {
                $scope.DataSourceParameters.push(referenceName);
            }
            if (!$scope.DataSourceFlag.hasOwnProperty(referenceName)) {
                $scope.DataSourceFlag.push(referenceName);
            }
            if (!$scope.DataSourceColumns.hasOwnProperty(referenceName)) {
                $scope.DataSourceColumns.push(referenceName);
            }
            if (!$scope.DataSourceObject.hasOwnProperty(referenceName)) {
                $scope.DataSourceObject.push(referenceName);
            }
            if (!$scope.DataSourceLoadStatus.hasOwnProperty(referenceName)) {
                $scope.DataSourceLoadStatus.push(referenceName);
            }
            if (!$scope.DataSourceModel.hasOwnProperty(referenceName)) {
                $scope.DataSourceModel.push(referenceName);
            }
            if (!$scope.DataSourceParamStatus.hasOwnProperty(referenceName)) {
                $scope.DataSourceParamStatus.push(referenceName);
            }
            $scope.DataSourceParameters[referenceName] = {};
            $scope.DataSourceCriteria[referenceName] = {};
            $scope.DataSource[referenceName] = {};
            $scope.DataSourceFlag[referenceName] = {};
            $scope.DataSourceColumns[referenceName] = {};
            $scope.DataSourceObject[referenceName] = {};
            $scope.DataSourceImages[referenceName] = {};
            $scope.DataSourceOrderBy[referenceName] = {};
            $scope.DataSourceMapMarkers[referenceName] = {};
            $scope.DataSourceGroupBy[referenceName] = {};
            $scope.DataSourceSelect[referenceName] = {};
            $scope.DataSourceJoin[referenceName] = {};
            $scope.DataSourceLoadStatus[referenceName] = false;
            $scope.DataSourceParamStatus[referenceName] = false;
            $scope.DataSourceModel[referenceName] = "BusinessModel";
        }

        $scope.setDataSourceParameter = function (referenceName, paramName, paramValue, stringify) {
            $scope.DataSourceParamStatus[referenceName] = true;
            if (stringify)
                paramValue = "'" + paramValue + "'";

            $scope.DataSourceParameters[referenceName][paramName] = paramValue;
        }

        $scope.setDataSourceModel = function (referenceName, modelName) {
            $scope.DataSourceModel[referenceName] = modelName;
        }

        $scope.setDataSourceFlag = function (referenceName, flagName, flagValue) {
            $scope.DataSourceFlag[referenceName][flagName] = flagValue;
        }

        $scope.setDataSourceObject = function (referenceName, objectName, objectValue) {
            $scope.DataSourceObject[referenceName][objectName] = objectValue;
        }

        $scope.setDataSourceCriteria = function (referenceName, criteriaField, criteriaValue, criteriaOperator) {
            if (!$scope.DataSourceCriteria[referenceName].hasOwnProperty(criteriaField)) {
                $scope.DataSourceCriteria[referenceName][criteriaField] = {};
            }
            $scope.DataSourceCriteria[referenceName][criteriaField]['Value'] = criteriaValue;
            $scope.DataSourceCriteria[referenceName][criteriaField]['Operator'] = criteriaOperator;
        }

        $scope.setDataSourceOrderBy = function (referenceName, orderByField, alias, orderByDesc) {
            if (!$scope.DataSourceOrderBy[referenceName].hasOwnProperty(orderByField)) {
                $scope.DataSourceOrderBy[referenceName][orderByField] = {};
            }
            $scope.DataSourceOrderBy[referenceName][orderByField]['Alias'] = "";
            $scope.DataSourceOrderBy[referenceName][orderByField]['Desc'] = "false";
            if (orderByDesc)
                $scope.DataSourceOrderBy[referenceName][orderByField]['Desc'] = orderByDesc;
            if (alias)
                $scope.DataSourceOrderBy[referenceName][orderByField]['Alias'] = alias;
        }

        $scope.setDataSourceGroupBy = function (referenceName, groupByField, alias) {
            if (!$scope.DataSourceGroupBy[referenceName].hasOwnProperty(groupByField)) {
                $scope.DataSourceGroupBy[referenceName][groupByField] = {};
            }
            $scope.DataSourceGroupBy[referenceName][groupByField]['Alias'] = "";
            if (alias) {
                $scope.DataSourceGroupBy[referenceName][groupByField]['Alias'] = alias;
            }
        }

        $scope.setDataSourceSelect = function (referenceName, selectField, alias, displayAs, value) {
            if (!displayAs)
                displayAs = selectField;
            if (!$scope.DataSourceSelect[referenceName].hasOwnProperty(displayAs)) {
                $scope.DataSourceSelect[referenceName][displayAs] = {};
            }
            $scope.DataSourceSelect[referenceName][displayAs]['Field'] = "";
            $scope.DataSourceSelect[referenceName][displayAs]['Alias'] = "";
            $scope.DataSourceSelect[referenceName][displayAs]['Value'] = "";
            $scope.DataSourceSelect[referenceName][displayAs]['Field'] = selectField;

            if (alias)
                $scope.DataSourceSelect[referenceName][displayAs]['Alias']= alias;
            if (value)
                $scope.DataSourceSelect[referenceName][displayAs]['Value'] = value;
        }

        $scope.getDelimitedValueFromDS = function (referenceName, sourceField, conditionField, criteria, delimiter) {
            var returnValue = '';
            for (var i = 0; i < $scope.DataSource[referenceName].length; i++) {
                var value = $scope.DataSource[referenceName][i][conditionField];
                if (value == criteria)
                {
                    if (returnValue == '')
                    {
                        returnValue = $scope.DataSource[referenceName][i][sourceField];
                    }
                    else
                    {
                        returnValue = returnValue + delimiter + $scope.DataSource[referenceName][i][sourceField];
                    }
                }
            }
            return returnValue;
        }

        $scope.setDataSourceJoin = function (referenceName, join, alias1, alias2, operand1, operator, operand2) {
            if (!$scope.DataSourceJoin[referenceName].hasOwnProperty(alias1)) {
                $scope.DataSourceJoin[referenceName][alias1] = {};
            }
            $scope.DataSourceJoin[referenceName][alias1]['join'] = join;
            $scope.DataSourceJoin[referenceName][alias1]['Alias2'] = "";
            if (alias2)
                $scope.DataSourceJoin[referenceName][alias1]['Alias2'] = alias2;
            $scope.DataSourceJoin[referenceName][alias1]['Operand1'] = operand1;
            $scope.DataSourceJoin[referenceName][alias1]['Operator'] = operator;
            $scope.DataSourceJoin[referenceName][alias1]['Operand2'] = operand2;
        }

        $scope.updateDataSourceRecordById = function (referenceName, elementName, primaryKey) {
            // Function not implemented yet.
        };

        $scope.updateDataSourceRecord = function (referenceName, elementName) {
            $scope.DataSourceLoadStatus[referenceName] = false;
            $http.post('/BusinessObject/UpdateDataSourceRecord', {
                elementName: elementName,
                modelName: $scope.DataSourceModel[referenceName],
                updateValuePair: $scope.DataSourceObject[referenceName]
            }).then(function (response) {
                $scope.DataSource[referenceName] = response.data;
                $scope.DataSourceLoadStatus[referenceName] = true;
            });
        };

        $scope.insertDataSourceRecord = function (referenceName, elementName) {
            $scope.DataSourceLoadStatus[referenceName] = false;
            $http.post('/BusinessObject/InsertDataSourceRecord', {
                elementName: elementName,
                modelName: $scope.DataSourceModel[referenceName],
                insertValuePair: $scope.DataSourceObject[referenceName]
            }).then(function (response) {
                $scope.DataSource[referenceName] = response.data;
                $scope.DataSourceLoadStatus[referenceName] = true;
            });
        };

        $scope.insertDataSourceRecords = function (referenceName, elementName, dataList) {
            $scope.DataSourceLoadStatus[referenceName] = false;
            for (var i = 0; i < dataList.length; i++) {
                var data = dataList[i];
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        if (data[key] == '--Index--') {
                            data[key] = i.toString();
                        }
                    }
                }
            }
            $http.post('/BusinessObject/InsertDataSourceRecords', {
                elementName: elementName,
                modelName: $scope.DataSourceModel[referenceName],
                insertValuePairs: dataList
            }).then(function (response) {
                $scope.DataSourceLoadStatus[referenceName] = true;
            });
        };

        $scope.getDataSource = function (referenceName, elementName) {
            $scope.DataSourceLoadStatus[referenceName] = false;
            $http.post('/BusinessObject/GetDataSource', {
                elementName: elementName,
                modelName: $scope.DataSourceModel[referenceName],
                searchCriteria: $scope.DataSourceCriteria[referenceName],
                orderBy: $scope.DataSourceOrderBy[referenceName],
                groupBy: $scope.DataSourceGroupBy[referenceName],
                select: $scope.DataSourceSelect[referenceName],
                join: $scope.DataSourceJoin[referenceName]
            }).then(function (response) {
                $scope.DataSource[referenceName] = response.data;
                $scope.DataSourceLoadStatus[referenceName] = true;
            });
        };

        $scope.getDataSourceByParameter = function (referenceName, elementName, parameter, value, displayFlag) {
            $scope.CustomDisplayFlag = displayFlag;
            $scope.setDataSourceParameter(referenceName, parameter, value);
            $scope.getDataSource(referenceName, elementName);
        };

        $scope.getColumnsByProcedure = function (referenceName, procName) {
            $scope.DataSourceLoadStatus[referenceName] = false;
            $http.post('/BusinessObject/GetColumnsByProcedure', {
                referenceName: referenceName,
                procName: procName,
                parameters: $scope.DataSourceParameters[referenceName]
            }).then(function (response) {
                $scope.DataSourceColumns[referenceName] = response.data;
                $scope.DataSourceLoadStatus[referenceName] = true;
            });
        };

        $scope.getDataSourceByProcedure = function (referenceName, procName) {
            $scope.DataSourceLoadStatus[referenceName] = false;
            $http.post('/BusinessObject/GetDataByProcedure', {
                referenceName: referenceName,
                procName: procName,
                parameters: $scope.DataSourceParameters[referenceName],
                select: $scope.DataSourceSelect[referenceName]
            }).then(function (response) {
                $scope.DataSource[referenceName] = response.data;
                $scope.DataSourceLoadStatus[referenceName] = true;
            });
        };

        $scope.exportDataSource = function (referenceName, fileName) {
            $http.post('/BusinessObject/ExportDataByProcedure', {
                referenceName: referenceName,
                fileName: fileName,
                parameters: $scope.DataSourceParameters[referenceName],
                select: $scope.DataSourceSelect[referenceName]
            }).then(function (response) {
                $scope.setDataSourceFlag(referenceName, "ExportFile", response.data);
                $scope.TempFileData = response.data;
            });
        }

        $scope.convertElementToDashboard = function (elementName) {
            $http.post('/BusinessObject/ConvertElementToDashboard', {
                elementName: elementName
            }).then(function (response) {
            });
        }

        $scope.setMapMarkerGeoCode = function (ds, id, data) {
            $scope.LastMapMarker = data;
            ds[id] = data;
            $scope.MapMarkers.push(data);
            return data;
        }

        $scope.setMapMarkers = function (ds, id, street, city, state, zip) {
            $http.post('/BusinessObject/GetGeoCode', {
                street: street,
                city: city,
                state: state,
                zip: zip
            }).then(function (response) {
                $scope.LastMapMarker = response.data;
                ds[id] = response.data;
                $scope.MapMarkers.push(response.data);
                return response.data;
            });
        }

        $scope.summarizeDataSource = function (ds, field) {
            var total = 0;
            if (ds) {
                for (var i = 0; i < ds.length; i++) {
                    total += parseFloat(ds[i][field]);
                }
            }
            return total;
        }

        $scope.initValue = function (value, defaultValue) {
            if (value) {
                return value;
            }
            return defaultValue;
        }

        $scope.viewDataSource = function (rn, e) {
            $scope.loading = true;
            $http.post('/BusinessObject/SelectDataSourceToDisplay', { elementName: e, searchCriteria: $scope.DataSourceCriteria[rn] }).then(function (response) {
                $window.location.href = $window.location.protocol + "//" + $window.location.host + "/BusinessObject/DisplayBusinessObjects/" + response.data.BusinessElementID;
            });
        };

        $scope.getDataSourceImage = function (e, f, id) {
            $http.post('/BusinessObject/GetImageSource', { fieldName: f, id: id }).then(function (response) {
                if (response.data['Image'] && response.data['Image'].length > 0)
                    $scope.DataSourceImages[e][response.data['FieldName']] = response.data['Image'];
            });
        };

        $scope.updateDataSource = function (ds, elementName) {
            $http.post('/BusinessObject/UpdateDataSource', { activeObjects: ds, elementName: elementName }).then(function (response) {
            });
        }

        $scope.updateDataSourceObject = function (dsObject, elementName) {
            $http.post('/BusinessObject/UpdateDataSourceObject', { activeObject: dsObject, elementName: elementName }).then(function (response) {
                dsObject = response.data;
            });
        }

        $scope.updateDataSourceObjectByIndex = function (referenceName, index, elementName) {
            var dsObject = $scope.DataSource[referenceName][index];
            $http.post('/BusinessObject/UpdateDataSourceObject', { activeObject: dsObject, elementName: elementName }).then(function (response) {
                $scope.DataSource[referenceName][index] = response.data;
            });
        }

        $scope.insertDataSourceObject = function (dsObject, elementName) {
            $http.post('/BusinessObject/InsertDataSourceObject', { activeObject: dsObject, elementName: elementName }).then(function (response) {
                dsObject = response.data;
            });
        }

        $scope.insertDataSourceObjectByIndex = function (referenceName, index, elementName) {
            var dsObject = $scope.DataSource[referenceName][index];
            $http.post('/BusinessObject/InsertDataSourceObject', { activeObject: dsObject, elementName: elementName }).then(function (response) {
                $scope.DataSource[referenceName][index] = response.data;
            });
        }

        $scope.createReportProcedure = function (reportProcedureId) {
            $http.post('/BusinessObject/CreateReportProcedure', { reportProcedureId: reportProcedureId }).then(function (response) {
            });
        }
        $scope.createDataSourceObject = function (referenceName, elementName) {
            $http.post('/BusinessObject/InsertDataSourceObject', { elementName: elementName }).then(function (response) {
                $scope.DataSource[referenceName].splice($scope.DataSource[referenceName].length, 0, response.data);
            });
        }

        $scope.getImageSource = function (f, id) {
            $http.post('/BusinessObject/GetImageSource', { fieldName: f.Name, id: id }).then(function (response) {
                if (!$scope.Images.hasOwnProperty(response.data['FieldName'])) {
                    $scope.Images.push(response.data['FieldName']);
                }
                if (response.data['Image'] && response.data['Image'].length > 0)
                    $scope.Images[response.data['FieldName']] = response.data['Image'];
            });
        };

        $scope.getFieldImages = function () {
            if ($scope.Model.imageCycle > $scope.Model.ImageCycleCount) {
                clearTimeout($scope.imageCycleTimer);
            }

            $scope.imageCycle++;
            var viewFields = $scope.Model.ViewFields[$scope.Model.BusinessElement.Name];
            var activeObject = $scope.Model.CurrentPath.ActiveObject;
            for (i = 0; i < viewFields.length; i++) {
                var id = activeObject[viewFields[i].Name];
                if (viewFields[i].ElementFieldTypeID == "9" && id && id.length > 0)
                    $scope.getImageSource(viewFields[i], id);
            }
            $scope.getBackgroundImageSource();
        };

        $scope.resetImageCycle = function () {
            $scope.Images = [];
            $scope.imageCycle = 0;
            $scope.getFieldImages();
            //$scope.imageCycleTimer = setTimeout($scope.getFieldImages, $scope.Model.ImageCycleRate); // Change image every 2 seconds
        }

        if ($scope.Model.DisplayMode == 3) {
            $scope.resetImageCycle();
        }

        $scope.clickAttachFile = function () {
            $("#attachButton").click(function () {
                $("#attachFile").click();
            })
        }

        $scope.uploadImage = function (viewField) {
            $scope.loading = true;
            $scope.formData = $scope.data['formData'];
            $scope.formData.append('id', viewField.ID);
            $http.post('/BusinessObject/UploadImage', $scope.formData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }}).then(function (response) {
                    $scope.Model.CurrentPath.ActiveObject[viewField.Name] = response.data['Name'];
                    $scope.Images[viewField.Name] = response.data['Content'];
                    $scope.loading = false;
            });
        }

        $scope.importFile = function (id) {
            $scope.loading = true;
            $scope.formData = $scope.data['formData'];
            $scope.formData.append('id', id);
            $http.post('/BusinessObject/UploadFile', $scope.formData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }}).then(function (response) {
                    var beId = response.data;
                    $window.location.href = $window.location.protocol + "//" + $window.location.host + "/BusinessElement/ViewObjects/" + beId;
                });

            //$("#importButton").click(function () {
            //    $("#importFile").click();
            //})
        }

        $scope.importData = function (id, type, userId) {
            $scope.loading = true;
            $scope.formData = $scope.data['formData'];
            $scope.formData.append('id', id);
            $scope.formData.append('type', type);
            $scope.formData.append('userId', userId);
            $http.post('/BusinessObject/ImportData', $scope.formData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).then(function (response) {
                $window.location.reload();
                //var beId = response.data;
                //$window.location.href = $window.location.protocol + "//" + $window.location.host + "/BusinessElement/ViewObjects/" + beId;
            });

            //$("#importButton").click(function () {
            //    $("#importFile").click();
            //})
        }

        $scope.previousObject = function () {
            $scope.loading = true;
            $http.post('/BusinessObject/EditPreviousObject', { activeObject: $scope.Model.CurrentPath.ActiveObject }).then(function (response) {
                $scope.Model = response.data;
                $scope.resetImageCycle();
                $scope.loading = false;
            });
        }

        $scope.nextObject = function () {
            $scope.loading = true;
            $http.post('/BusinessObject/EditNextObject', { activeObject: $scope.Model.CurrentPath.ActiveObject }).then(function (response) {
                $scope.Model = response.data;
                $scope.resetImageCycle();
                $scope.loading = false;
            });
        }

        $scope.updateSortField = function (field) {
            $scope.loading = true;
            $http.post('/BusinessObject/UpdateSortField', { field: field }).then(function (response) {
                $scope.Model = response.data;
                $scope.loading = false;
            });
        }

        $scope.expandRelatedObjects = function (elementName, fieldName) {
            $scope.loadingRelated = true;
            $http.post('/BusinessObject/ExpandRelatedObjects', { elementName: elementName, fieldName: fieldName }).then(function (response) {
                $scope.Model.ElementLinkages = response.data;
                $scope.loadingRelated = false;
            });
        }

        $scope.collapseRelatedObjects = function (elementName, fieldName) {
            $scope.loadingRelated = true;
            $http.post('/BusinessObject/CollapseRelatedObjects', { elementName: elementName, fieldName: fieldName }).then(function (response) {
                $scope.Model.ElementLinkages = response.data;
                $scope.loadingRelated = false;
            });
        }

        $scope.navigate = function (menuItem) {
            $scope.loading = true;
            $window.location.href = $window.location.protocol + "//" + $window.location.host + "/" + menuItem.ControllerName + "/" + menuItem.ActionName;
        }

        $scope.checkIfAllFieldsCompleted = function () {
            $scope.requiredFieldsCompleted = true;
            for (i = 0; i < $scope.Model.Fields.length; i++) {
                var field = $scope.Model.Fields[i];
                if (field.IsNullable == false && (field.Name in $scope.Model.CurrentPath.ActiveObject) == false && field.IsCalculated == false) {
                    $scope.requiredFieldsCompleted = false;
                    break;
                }
            }
        }

        $scope.checkIfAllFieldsCompleted();

        $scope.gotoPage = function (page) {
            if ($scope.currentPage != page || page != $scope.Model.CurrentPage) {
                $scope.loading = true;
                $http.post('/BusinessObject/GotoPage', { activeObject: $scope.Model.CurrentPath.ActiveObject, pageNumber: page
                }).then(function (response) {
                    $scope.Model = response.data;
                    $scope.currentPage = $scope.Model.CurrentPage;
                    $scope.loading = false;
                });
            }
        }

        $scope.previousPage = function () {
            $scope.loading = true;
            $http.post('/BusinessObject/PreviousPage', { activeObject: $scope.Model.CurrentPath.ActiveObject }).then(function (response) {
                $scope.Model = response.data;
                $scope.currentPage = $scope.Model.CurrentPage;
                $scope.loading = false;
            });
        }

        $scope.nextPage = function () {
            $scope.loading = true;
            $http.post('/BusinessObject/NextPage', { activeObject: $scope.Model.CurrentPath.ActiveObject }).then(function (response) {
                $scope.Model = response.data;
                $scope.currentPage = $scope.Model.CurrentPage;
                $scope.loading = false;
            });
        }

        $scope.clearField = function (id) {
            $scope.loading = true;
            $http.post('/BusinessObject/ClearField', {id: id, activeObject: $scope.Model.CurrentPath.ActiveObject }).then(function (response) {
                $scope.Model = response.data;
                $scope.loading = false;
            });
        }

        $scope.runWorkflow = function () {
            $scope.loading = true;
            $http.post('/BusinessObject/Update', { existingCache: $scope.Model.CurrentPath }).then(function (response) {
                $http.post('/BusinessObject/RunWorkflow', { activeObject: $scope.Model.CurrentPath.ActiveObject }).then(function () {
                });
                var cache = response.data;
                $window.location.href = $window.location.protocol + "//" + $window.location.host + "/BusinessObject/" + cache.ViewName + "/" + cache.ID;
            });
            $scope.loading = false;
        };

        $scope.hightlightText = function (c) {
            var selection = $window.getSelection();
            var viewFields = $scope.Model.ViewFields[$scope.Model.BusinessElement.Name];
            for (i = 0; i < viewFields.length; i++) {
                var viewField = viewFields[i];
                if (viewField.ElementFieldTypeID == "5") {
                    $scope.Model.CurrentPath.ActiveObject[viewField.DisplayAs] = selection.toString();
                }
            };
        };

        $scope.showFields = function (displayMode) {
            $http.post('/BusinessObject/ShowFields', { displayMode: displayMode }).then(function (response) {
                $scope.Model.ColumnViewFields = response.data;
                $scope.Model.DisplayMode = displayMode;
            });
        };

        $scope.setDSDestinationField = function (elementName, referenceName, index, field) {
            if ($scope.dsDragField && $scope.dsDragReference == referenceName) {
                var ds = $scope.DataSource[referenceName];
                var displayOrder = ds[index][field];
                var nextIndex = parseInt(displayOrder) + 1;
                ds[$scope.dsDragField][field] = displayOrder;

                for (i = index; i < ds.length; i++) {
                    if (i != $scope.dsDragField) {
                        ds[i][field] = parseInt(nextIndex);
                        nextIndex = parseInt(nextIndex) + 1;
                    }
                }
                $scope.loading = true;
                $scope.updateDataSource(ds, elementName);
                $scope.getDataSource(referenceName, elementName);
                $window.location.reload();
            }
        };

        $scope.setDSDragField = function (referenceName, index) {
            $scope.dsDragField = index;
            $scope.dsDragReference = referenceName;
        };

        $scope.setDestinationField = function (id) {
            $scope.loading = true;
            $scope.destinationFieldId = id;
            if ($scope.dragFieldId) {
                $http.post('/BusinessObject/ChangeDisplayOrder', { field1Id: $scope.dragFieldId, field2Id: $scope.destinationFieldId }).then(function (response) {
                    $scope.Model.ColumnViewFields = response.data;
                    $scope.loading = false;
                });
            }
        };

        $scope.setDragField = function (id) {
            $scope.dragFieldId = id;
        };

        $scope.gotoElement = function (key) {
            $scope.loading = true;
            $window.location.href = $window.location.protocol + "//" +$window.location.host + "/BusinessObject/GotoElement/" +key;
        };

        $scope.goBack = function (viewName) {
            $scope.loading = true;
            $window.location.href = $window.location.protocol + "//" + $window.location.host + "/BusinessObject/GoBack/" + viewName;
        };

        $scope.cancelFieldSearch = function () {
            $scope.states.showSearchFieldForm = false;
        };

        $scope.displayObjects = function (elementId) {
            $scope.states.showSearchFieldForm = false;
            $scope.states.displayType = "DisplayObjects";
        };

        $scope.displayRelatedObjects = function (relatedElement, relatedField) {
            $scope.loading = true;
            $http.post('/BusinessObject/SelectRelatedObjectsToDisplay', { relatedElement: relatedElement, relatedField: relatedField, activeObject: $scope.Model.CurrentPath.ActiveObject
            }).then(function () {
                $window.location.href = $window.location.protocol + "//" + $window.location.host + "/BusinessObject/DisplayBusinessObjects/" + relatedElement["BusinessElementID"];
            });
        };

        $scope.editObjectByName = function (elementName, column, id) {
            $scope.loading = true;
            $http.post('/BusinessObject/SelectBusinessObjectToEditByName', { elementName: elementName, column: column, id: id }).then(function (response) {
                $window.location.href = $window.location.protocol + "//" + $window.location.host + "/BusinessObject/EditBusinessObject/" + response.data.ID;
            });
        };

        $scope.editObject = function (elementId, column, id) {
            $scope.loading = true;
            $http.post('/BusinessObject/SelectBusinessObjectToEdit', { elementId: elementId, column: column, id: id }).then(function (response) {
                $window.location.href = $window.location.protocol + "//" + $window.location.host + "/BusinessObject/EditBusinessObject/" + elementId;
            });
        };

        $scope.confirmDeleteObject = function () {
            $scope.loading = true;
            $http.post('/BusinessObject/SelectBusinessObjectToDelete').then(function (response) {
                $window.location.href = $window.location.protocol + "//" + $window.location.host + "/BusinessObject/DeleteBusinessObject/" + response.data.ID;
            });
        };

        $scope.createObjectByName = function (name) {
            $scope.loading = true;
            $http.post('/BusinessObject/CreateBusinessObjectExternalByName', { name: name }).then(function (response) {
                $window.location.href = $window.location.protocol + "//" + $window.location.host + "/BusinessObject/CreateBusinessObject";
            });
        };

        $scope.createObject = function () {
            $scope.loading = true;
            $http.post('/BusinessObject/SelectBusinessObjectToCreate', { foreignKeyField: $scope.ViewField }).then(function (response) {
                $window.location.href = $window.location.protocol + "//" + $window.location.host + "/BusinessObject/CreateBusinessObject";
            });
        };

        $scope.createRelatedObject = function (relatedElement, relatedField) {
            $scope.loading = true;
            $http.post('/BusinessObject/SelectRelatedObjectToCreate', { relatedElement: relatedElement, relatedField: relatedField, activeObject: $scope.Model.CurrentPath.ActiveObject }).then(function (response) {
                $window.location.href = $window.location.protocol + "//" + $window.location.host + "/BusinessObject/CreateBusinessObject";
            });
        };

        $scope.searchField = function (viewField) {
            $scope.ViewField = viewField;
            $scope.loading = true;
            $http.post('/BusinessObject/SearchFieldObjects', { viewField: viewField, activeObject: $scope.Model.CurrentPath.ActiveObject }).then(function (response) {
                $scope.SearchFieldData = response.data;
                $scope.states.showSearchFieldForm = true;
                $scope.loading = false;
            });
        };

        $scope.getDataDrivenValues = function () {
            if ($scope.Model.CurrentPath.ActiveObject) {
                $http.post('/BusinessObject/GetDataDrivenFieldLinkedValues', { activeObject: $scope.Model.CurrentPath.ActiveObject }).then(function (response) {
                    $scope.Model.CurrentPath.ActiveObject = response.data;
                    $scope.checkIfAllFieldsCompleted();
                });
            }
        }

        $scope.selectSearchObject = function (obj, searchFieldData) {
            $scope.loading = true;
            $scope.Model.CurrentPath.ActiveObject[$scope.ViewField.Name] = obj[searchFieldData.BusinessElement.PrimaryKeyColumn];
            $scope.Model.CurrentPath.ActiveObject[$scope.ViewField.DisplayAs] = obj[$scope.ViewField.RelatedElementDisplayField];
            if (searchFieldData.DataDrivenFields) {
                for (i = 0; i < searchFieldData.DataDrivenFields.length; i++) {
                    var ddField = searchFieldData.DataDrivenFields[i];
                    if (obj[ddField.DisplayFieldName])
                        $scope.Model.CurrentPath.ActiveObject[ddField.RelatedFieldName] = obj[ddField.DisplayFieldName];
                    else
                        $scope.Model.CurrentPath.ActiveObject[ddField.RelatedFieldName] = obj[ddField.DisplayFieldDisplayName];
                    $scope.Model.CurrentPath.ActiveObject[ddField.RelatedFieldDisplayName] = obj[ddField.DisplayFieldDisplayName];
                }
                $http.post('/BusinessObject/GetDataDrivenFieldLinkedValues', { activeObject: $scope.Model.CurrentPath.ActiveObject }).then(function (response) {
                    $scope.Model.CurrentPath.ActiveObject = response.data;
                    $scope.checkIfAllFieldsCompleted();
                });
            }
            $scope.loading = false;
            $scope.states.showSearchFieldForm = false;
        };

        $scope.filterSearchFieldObjects = function (searchCriteria) {
            $scope.loading = true;
            $http.post('/BusinessObject/FilterSearchFieldObjects', { searchCriteria: searchCriteria }).then(function (response) {
                $scope.SearchFieldData = response.data;
            });
            $scope.loading = false;
        };

        $scope.searchObjects = function (searchCriteria) {
            $scope.loading = true;
            $http.post('/BusinessObject/Search', { searchCriteria: searchCriteria }).then(function (response) {
                $scope.Model = response.data;
                $scope.loading = false;
            });
        };

        $scope.updateObject = function (model, elementId) {
            if ($scope.Model.DisplayMode != 3) {
                $scope.insertObject(3);
                return;
            }
            $scope.loading = true;
            $scope.getDataDrivenValues();
            $http.post('/BusinessObject/Update', { activeObject: $scope.Model.CurrentPath.ActiveObject
            }).then(function (response) {
                var cache = response.data;
                $window.location.href = $window.location.protocol + "//" + $window.location.host + "/BusinessObject/" + cache.ViewName + "/" + cache.ID;
            });
        };

        $scope.deleteById = function (id) {
            $scope.loading = true;
            $http.post('/BusinessObject/DeleteById', { id: id }).then(function (response) {
                $scope.Model.BusinessObjects = response.data;
                $scope.loading = false;
            });
        };

        $scope.showDeleteButton = function () {
            $scope.deleteOn = !$scope.deleteOn;

            if ($scope.deleteOn == false)
                $scope.multipleDeleteLabel = "Turn on Delete Multiple";
            else
                $scope.multipleDeleteLabel = "Turn off Delete Multiple"
        };

        $scope.deleteObject = function (model, elementId) {
            $scope.loading = true;
            $http.post('/BusinessObject/Delete', { activeObject: $scope.Model.CurrentPath.ActiveObject }).then(function () {
                var id = elementId
                $window.location.href = $window.location.protocol + "//" + $window.location.host + "/BusinessObject/RedirectFromDelete/" + id;
            });
        };

        $scope.insertObject = function (nextDisplayMode) {
            $scope.checkIfAllFieldsCompleted();
            if ($scope.requiredFieldsCompleted == true) {
                $scope.loading = true;
                $scope.getDataDrivenValues();
                $http.post('/BusinessObject/GetDataDrivenFieldLinkedValues', { activeObject: $scope.Model.CurrentPath.ActiveObject }).then(function (response) {
                    $scope.Model.CurrentPath.ActiveObject = response.data;
                    $http.post('/BusinessObject/Insert', { activeObject: $scope.Model.CurrentPath.ActiveObject, nextDisplayMode: nextDisplayMode }).then(function (response) {
                        var cache = response.data;
                        $window.location.href = $window.location.protocol + "//" + $window.location.host + "/BusinessObject/" + cache.ViewName + "/" + cache.ID;
                    });
                });
            }
        };

        $scope.insertRelatedObject = function (model, elementId, column, id) {
            $scope.loading = true;
            $http.post('/BusinessObject/InsertRelated', { businessObjectDict: model }).then(function () {
                $window.location.href = $window.location.protocol + "//" + $window.location.host + "/BusinessObject/DisplayRelatedBusinessObjects/" + elementId + "/" + column + "/" + id;
            });
        };

        $scope.cancelEdit = function () {
            $scope.loading = true;
            $window.location.href = $window.location.protocol + "//" + $window.location.host + "/BusinessObject/GoBack/";
            $scope.loading = false;
        };
        $scope.loading = false;
    });
});

angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('myDirective', function (httpPostFactory, $http) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            element.bind('change', function() {
                var formData = new FormData();
                var fileObject = element[0].files[0];
                formData.append('file', fileObject);
                formData.append('fileName', fileObject.name);
                formData.append('fileSize', fileObject.size);
                formData.append('fileType', fileObject.type);
                scope.fileName = fileObject.name;
                scope.data['formData'] = formData;
                scope.$apply();
            });
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').factory('httpPostFactory', function($http) {
    return function(file, data, callback) {
        $http({
            url: file,
            method: "POST",
            data: data,
            headers: {
                'Content-Type': undefined
            }
        }).then(function(response) {
            callback(response.data);
        });
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('dsDragDrop', function () {
    return {
        link: function (scope, element) {
            element.attr("draggable", "true");
            element.on('dragover', function (event) {
                event.preventDefault();
            });
            element.on('drop', function (event) {
                var referenceName = element.attr("referenceName");
                var index = element.attr("index");
                var field = element.attr("field");
                var elementName = element.attr("element");
                scope.setDSDestinationField(elementName, referenceName, index, field);
            });
            element.on('dragstart', function (event) {
                var referenceName = element.attr("referenceName");
                var index = element.attr("index");
                scope.setDSDragField(referenceName, index);
            });
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('dragDrop', function () {
    return {
        link: function (scope, element) {
            element.attr("draggable", "true");
            element.on('dragover', function (event) {
                event.preventDefault();
            });
            element.on('drop', function (event) {
                scope.setDestinationField(event.target.id);
            });
            element.on('dragstart', function (event) {
                scope.setDragField(event.target.id);
            });
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('clickelement', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('clickelement');
            }, function (val) {
                scope.clickElement(val);
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('gotopage', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('gotopage');
            }, function (val) {
                scope.editObjectByName(element.attr('element'), element.attr('field'), element.attr('objectid'));
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('initchart', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('initchart');
            }, function (val) {
                if (val) {
                    scope.initChart(val, element.attr('element'), element.attr('type'), element.attr('title'), element.attr('width'), element.attr('height'));
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('addchartcolumn', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('addchartcolumn');
            }, function (val) {
                if (val) {
                    scope.addChartColumn(val, element.attr('columnName'), element.attr('columnType'));
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('addchartrow', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('addchartrow');
            }, function (val) {
                if (val) {
                    scope.addChartRow(val, JSON.parse(element.attr('rowData')));
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('loadcharts', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('loadcharts');
            }, function (val) {
                scope.loadCharts();
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('setdefaultvalue', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('setdefaultvalue');
            }, function (val) {
                if (val) {
                    scope.setDefaultValue(val, element.attr('value'));
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('setpersistentdata', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('setpersistentdata');
            }, function (val) {
                if (val) {
                    scope.setPersistentData(val, element.attr('value'));
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('setpersistentdataset', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('setpersistentdataset');
            }, function (val) {
                if (val) {
                    scope.setPersistentDataSet(val, element.attr('value'));
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('setactiveobjectvalue', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('setactiveobjectvalue');
            }, function (val) {
                if (val) {
                    scope.setActiveObjectValue(val, element.attr('value'));
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('initds', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('initds');
            }, function (val) {
                if (val) {
                    scope.initDataSource(val);
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('setdscriteria', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('setdscriteria');
            }, function (val) {
                if (val) {
                    scope.setDataSourceCriteria(val, element.attr('field'), element.attr('value'), element.attr('operator'));
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('setdschart', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('setdschart');
            }, function (val) {
                if (val) {
                    scope.setDataSourceCriteria(val, element.attr('xfield'), element.attr('yfield'), element.attr('operator'));
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('setdspie', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('setdspie');
            }, function (val) {
                if (val) {
                    scope.setDataSourceCriteria(val, element.attr('field'), element.attr('value'), element.attr('operator'));
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('setdsorderby', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('setdsorderby');
            }, function (val) {
                if (val) {
                    scope.setDataSourceOrderBy(val, element.attr('orderBy'), element.attr('alias'), element.attr('orderByDesc'));
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('setdsjoin', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('setdsjoin');
            }, function (val) {
                if (val) {
                    scope.setDataSourceJoin(val, element.attr('join'), element.attr('alias1'), element.attr('alias2'), element.attr('operand1'), element.attr('operator'), element.attr('operand2'));
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('setdsselect', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('setdsselect');
            }, function (val) {
                if (val) {
                    scope.setDataSourceSelect(val, element.attr('field'), element.attr('alias'), element.attr('displayAs'), element.attr('value'));
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('getdelimitedvaluefromds', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('getdelimitedvaluefromds');
            }, function (val) {
                if (val) {
                    scope.getDelimitedValueFromDS(val, element.attr('sourcefield'), element.attr('conditionfield'), element.attr('criteria'), element.attr('delimiter'));
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('setdsparameter', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('setdsparameter');
            }, function (val) {
                if (val) {
                    var stringify = false;
                    if (element.attr('stringify'))
                        stringify = element.attr('stringify');
                    scope.setDataSourceParameter(val, element.attr('paramName'), element.attr('paramValue'), stringify);
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('dateInput', function ($timeout) {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            //Angular 1.3 insert a formater that force to set model to date object, otherwise throw exception.
            //Reset default angular formatters/parsers
            ngModelCtrl.$formatters.length = 0;
            ngModelCtrl.$parsers.length = 0;
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('setdsflag', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('setdsflag');
            }, function (val) {
                if (val) {
                    scope.setDataSourceFlag(val, element.attr('flagName'), element.attr('flagValue'));
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('setdsobject', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('setdsobject');
            }, function (val) {
                if (val) {
                    scope.setDataSourceObject(val, element.attr('objectName'), element.attr('objectValue'));
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('setdsmodel', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('setdsmodel');
            }, function (val) {
                if (val) {
                    scope.setDataSourceModel(val, element.attr('modelName'));
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('createreportproc', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('createreportproc');
            }, function (val) {
                if (val) {
                    scope.createReportProcedure(val);
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('convertelementtodashboard', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('convertelementtodashboard');
            }, function (val) {
                if (val) {
                    scope.convertElementToDashboard(val);
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('setdsgroupby', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('setdsgroupby');
            }, function (val) {
                if (val) {
                    scope.setDataSourceGroupBy(val, element.attr('groupBy'), element.attr('alias'));
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('getdsbyproc', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('getdsbyproc');
            }, function (val) {
                if (val) {
                    var proc = element.attr('proc');
                    scope.getDataSourceByProcedure(val, proc);
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('getdscolumnsbyproc', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('getdscolumnsbyproc');
            }, function (val) {
                if (val) {
                    var proc = element.attr('proc');
                    scope.getColumnsByProcedure(val, proc);
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('getds', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('getds');
            }, function (val) {
                if (val) {
                    var e = element.attr('element');

                    if (e)
                        scope.getDataSource(val, e);
                    else
                        scope.getDataSource(val, val);
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('insertdsrecord', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('insertdsrecord');
            }, function (val) {
                if (val) {
                    var e = element.attr('element');

                    if (e)
                        scope.insertDataSourceRecord(val, e);
                    else
                        scope.insertDataSourceRecord(val, val);
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('updatedsrecord', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('updatedsrecord');
            }, function (val) {
                if (val) {
                    var e = element.attr('element');

                    if (e)
                        scope.updateDataSourceRecord(val, e);
                    else
                        scope.updateDataSourceRecord(val, val);
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('updatedsrecordbyid', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('updatedsrecordbyid');
            }, function (val) {
                if (val) {
                    var e = element.attr('element');

                    if (e)
                        scope.updateDataSourceRecordById(val, e);
                    else
                        scope.updateDataSourceRecordById(val, val);
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('getdsimage', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('getdsimage');
            }, function (val) {
                if (val) {
                    scope.getDataSourceImage(element.attr('referencename'), element.attr('field'), val);
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('setdsmapmarker', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('setdsmapmarker');
            }, function (val) {
                if (val) {
                    scope.setMapMarkers(val, element.attr('id'), element.attr('street'), element.attr('city'), element.attr('city'), element.attr('state'), element.attr('zip'));
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('setdsmapmarkergeocode', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('setdsmapmarkergeocode');
            }, function (val) {
                if (val) {
                    scope.setMapMarkerGeoCode(val, element.attr('id'), element.attr('geocode'));
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('expandlinkage', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('expandlinkage');
            }, function (val) {
                if (val) {
                    scope.expandRelatedObjects(val, element.attr('field'));
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('docelementstyle', function ($timeout) {
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
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('updatebgimage', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('updatebgimage');
            }, function (val) {
                if (val) {
                    scope.updateBackgroundImage(element.attr('value'), val);
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('setobjectvalue', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('setobjectvalue');
            }, function (val) {
                if (val) {
                    scope.setObjectValue(val, element.attr("field"), element.attr("value"));
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('setdisplayflag', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('setdisplayflag');
            }, function (val) {
                if (val) {
                    scope.setDisplayFlag(val);
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('slideshow', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return element.attr('slideshow');
            }, function (val) {
                if (val) {
                    scope.initSlideShow(element.attr('index'), val);
                }
            }, true);
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('ngFocus', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(attrs.ngFocus, function (val) {
                if (angular.isDefined(val) && val) {
                    $timeout(function () { element[0].focus(); });
                }
            }, true);

            element.bind('blur', function () {
                if (angular.isDefined(attrs.ngFocusLost)) {
                    scope.$apply(attrs.ngFocusLost);
                }
            });
        }
    };
});
angular.module('DynamicBusinessModelWeb.BusinessObjectController').directive('format', ['$filter', function ($filter) {
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {
            if (!ctrl) return;

            ctrl.$formatters.unshift(function (a) {
                return $filter(attrs.format)(ctrl.$modelValue)
            });

            elem.bind('blur', function(event) {
                var plainNumber = elem.val().replace(/[^\d|\-+|\.+]/g, '');
                elem.val($filter(attrs.format)(plainNumber));
            });
        }
    };
}]);

