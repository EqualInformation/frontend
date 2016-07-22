/* globals guardian */
define([
    'bonzo',
    'comment-count',
    'common/utils/get-property',
    'fastdom',
    'common/modules/experiments/ab',
    'common/modules/experiments/tests/utils/comment-blocker',
    'common/utils/assign',
    'common/utils/formatters',
    'common/utils/mediator',
    'common/utils/report-error'
], function (
    bonzo,
    commentCountWidget,
    getProperty,
    fastdom,
    ab,
    CommentBlocker,
    assign,
    formatters,
    mediator,
    reportError
) {

    function init(overrideConfig) {
        var widgetConfig = assign({
            apiBase: getProperty(guardian, 'config.page.ajaxUrl') + '/discussion/comment-counts.json',
            apiQuery: 'shortUrls',
            filter: function (node) {
                var shortUrl = node.getAttribute('data-loyalty-short-url');
                if (shortUrl && ab.isInVariant('ParticipationDiscussionTest', 'variant-1') && CommentBlocker.hideComments(shortUrl.replace('/p/','')) ) {
                    return false;
                }
                return true;
            },
            onupdate: function (node, count) {
                if (count === 0 && node.getAttribute('data-discussion-closed') === 'true') {
                    fastdom.write(function () {
                        bonzo(node.parentNode).remove();
                    });
                }
            },
            format: formatters.integerCommas
        }, overrideConfig);

        //Load new counts when more trails are loaded
        mediator.on('modules:related:loaded', function () {
            commentCountWidget.update(widgetConfig);
        });

        return commentCountWidget.load(widgetConfig)
        .catch(function (err) {
            reportError(err, {
                feature: 'comment-count'
            }, false);
        });
    }

    return {
        init: init
    };
});
