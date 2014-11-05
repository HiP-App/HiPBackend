
dependencies = [
    'ngRoute',
    'ui.bootstrap',
    'myApp.filters',
    'myApp.services',
    'myApp.controllers',
    'myApp.directives',
    'myApp.common',
    'myApp.routeConfig'
]

app = angular.module('myApp', dependencies)

angular.module('myApp.routeConfig', ['ngRoute'])
    .config ($routeProvider, $locationProvider) ->
        #$locationProvider.html5Mode(true);
        $routeProvider
            .when('/', {
                templateUrl: '/assets/partials/hipsupervisor.html'
            })
            .when('/group/create', {
                templateUrl: '/assets/partials/createGroup.html'
            })
            .when('/group/view/:uID', {
                templateUrl: '/assets/partials/groupview.html'
            })
            .when('/language/create', {
              templateUrl: '/assets/partials/createLangTerm.html'
            })
            .when('/messages/:recName', {
             templateUrl: '/assets/partials/messages.html'
            })
            .otherwise({redirectTo: '/'})

@commonModule = angular.module('myApp.common', [])
@controllersModule = angular.module('myApp.controllers', [])
@servicesModule = angular.module('myApp.services', [])
@modelsModule = angular.module('myApp.models', [])
@directivesModule = angular.module('myApp.directives', [])
@filtersModule = angular.module('myApp.filters', [])