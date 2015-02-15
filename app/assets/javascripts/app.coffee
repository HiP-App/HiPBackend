
dependencies = [
    'ngRoute',
    'ui.bootstrap',
    'ui.slider',
    'textAngular',
    'myApp.services',
    'myApp.alerts',
    'myApp.chat',
    'myApp.groups',
    'myApp.overlay',
    'myApp.filters',
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
                templateUrl: '/assets/partials/basic_myhip.html'
            })
            .when('/browse', {
              templateUrl: '/assets/partials/basic_showAllContent.html'
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
            .when('/group/create2', {
                templateUrl: '/assets/partials/myhip_createGroupTemplates.html'
            })
            .when('/group/rights/:uID', {
                templateUrl: '/assets/partials/myhip_readRights.html'
            })
            .when('/topic/modify/:userID', {
                templateUrl: '/assets/partials/myhip_modifyTopic.html'
            })
            .when('/topic/create', {
                templateUrl: '/assets/partials/myhip_createTopic.html'
            })
            .when('/templates/edit/', {
              templateUrl: '/assets/partials/myhip_editTemplates.html'
            })
            .when('/templates/edit/:key', {
                templateUrl: '/assets/partials/myhip_editTemplates.html'
            })
            .when('/group/propose', {
              templateUrl: '/assets/partials/group_proposeTopic.html'
            })
            .when('/group/view/:uID', {
                templateUrl: '/assets/partials/basic_groupView.html'
            })
            .when('/group/3d/:uID', {
                templateUrl: '/assets/partials/basic_groupMeshes.html'
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
            .when('/messages/send/:toUserUID/:title', {
              templateUrl: '/assets/partials/basic_sendMessage.html'
            })
            .when('/messages/view/:messageID', {
              templateUrl: '/assets/partials/basic_messagesDetails.html'
            })
            .when('/type/edit/:uID', {
              templateUrl: '/assets/partials/admin_modifyType.html'
            })
            .otherwise({redirectTo: '/'})

@commonModule = angular.module('myApp.common', [])
@servicesModule = angular.module('myApp.services', [])
@controllersModule = angular.module('myApp.controllers', ['myApp.services'])
@modelsModule = angular.module('myApp.models', [])
@directivesModule = angular.module('myApp.directives', [])
@filtersModule = angular.module('myApp.filters', [])

@alertModule = angular.module('myApp.alerts', [])
@chatModule = angular.module('myApp.chat', [])
@groupModule = angular.module('myApp.groups', ['myApp.services'])
@overlayModule = angular.module('myApp.overlay', [])