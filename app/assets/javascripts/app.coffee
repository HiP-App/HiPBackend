
dependencies = [
    'ngRoute',
    'ui.bootstrap',
    'textAngular',
    'myApp.alerts',
    'myApp.chat',
    'myApp.groups',
    'myApp.overlay',
    'myApp.filters',
    'myApp.services',
    'myApp.controllers',
    'myApp.directives',
    'myApp.common',
    'myApp.routeConfig',
    'ngSanitize'
]

app = angular.module('myApp', dependencies)

angular.module('myApp.routeConfig', ['ngRoute'])
    .config ($routeProvider, $locationProvider) ->
        #$locationProvider.html5Mode(true);
        $routeProvider
            .when('/', {
                templateUrl: '/assets/partials/index.html'
            })
            .when('/myhip', {
                templateUrl: '/assets/partials/basic_supervisorView.html'
            })
            .when('/contact', {
                templateUrl: '/assets/partials/basic_contact.html'
            })
            .when('/edit/:topicID', {
              templateUrl: '/assets/partials/group_editContent.html'
            })
            .when('/viewExternalSupervisor/:topicID', {
              templateUrl: '/assets/partials/group_topicDetailSupervisor.html'
            })
            .when('/group/create', {
                templateUrl: '/assets/partials/myhip_createGroup.html'
            })
            .when('/topic/modify/:userID', {
                templateUrl: '/assets/partials/myhip_modifyTopic.html'
            })
            .when('/topic/create', {
                templateUrl: '/assets/partials/myhip_createTopic.html'
            })
            .when('/group/propose', {
              templateUrl: '/assets/partials/group_proposeTopic.html'
            })
            .when('/group/view/:uID', {
                templateUrl: '/assets/partials/basic_groupView.html'
            })
            .when('/group/viewexternal/:uID', {
                templateUrl: '/assets/partials/basic_groupViewExternalAsSupervisor.html'
            })
            .when('/language/create', {
              templateUrl: '/assets/partials/admin_createLangTerm.html'
            })
            .when('/roles/create', {
              templateUrl: '/assets/partials/admin_roleManagement.html'
            })
            .when('/messages/all/:recName', {
              templateUrl: '/assets/partials/basic_messages.html'
            })
            .when('/messages/send', {
              templateUrl: '/assets/partials/basic_sendMessage.html'
            })
            .when('/messages/view/:messageID', {
              templateUrl: '/assets/partials/basic_messagesDetails.html'
            })
            .otherwise({redirectTo: '/'})

@commonModule = angular.module('myApp.common', [])
@controllersModule = angular.module('myApp.controllers', [])
@servicesModule = angular.module('myApp.services', [])
@modelsModule = angular.module('myApp.models', [])
@directivesModule = angular.module('myApp.directives', [])
@filtersModule = angular.module('myApp.filters', [])

@alertModule = angular.module('myApp.alerts', [])
@chatModule = angular.module('myApp.chat', [])
@groupModule = angular.module('myApp.groups', [])
@overlayModule = angular.module('myApp.overlay', [])