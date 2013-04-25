var wcChromeHeader = ['$rootScope',function(root) {
    return {
        restrict:   'A',
        link:   function(scope,el,attrs) {
            el.addClass('webCascadesHeader');
            root.wcHasHeader = true;
        }
    };
}];

var wcChromeFooter = ['$rootScope','$document',function(root,doc) {
    return {
        restrict:   'A',
        link:   function(scope,el,attrs) {
            el.addClass('webCascades');
            var isBack = attrs.wcFooter=='back',
                divTouch = doc[0].createElement('div'),
                divBtn = doc[0].createElement('div'),
                divGrip = doc[0].createElement('div'),
                divIcon = doc[0].createElement('div');
            
            divIcon.innerHTML = attrs.wcFooter=='back' ? '' : attrs.wcFooter;
            if(scope.wcIcon)    divIcon.className = scope.wcIcon;
            divGrip.className = 'webCascadesGrip';
            divTouch.className = 'webCascadesTouch' + (isBack ? ' webCascadesBackBar' : '');
            if(!isBack) divBtn.appendChild(divGrip);
            divBtn.appendChild(divIcon);
            divBtn.className = 'webCascadesBtn';
            if(isBack)  angular.element(divBtn).addClass('webCascadesBackBtn');
            else        angular.element(divBtn).addClass('webCascadesMainBtn');
            divBtn.appendChild(divIcon);
            el.append(divBtn);
            el.append(divTouch);
            root.wcHasFooter = true;
        }
    };
}];