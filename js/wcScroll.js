var wcScroll = ['$rootScope', '$timeout',
               function(root, wait) {
                   
  return {
    restrict: 'A',
    link: function(scope, element, attr) {
        element.addClass('wcScroll');
        var showScrollbars = attr.wcScroll!="menu";
        wait(function() {
            if(showScrollbars) {
                if(root.wcHasHeader) element.addClass('wcHasHeader');
                if(root.wcHasFooter) element.addClass('wcHasFooter');
            }
            scope.$iScroll = new iScroll(element[0], {
                scrollbarClass: 'mainScrollbar',
                hScrollbar:     showScrollbars,
                vScrollbar:     showScrollbars
            });
        }, 200);
    }
  };
}];