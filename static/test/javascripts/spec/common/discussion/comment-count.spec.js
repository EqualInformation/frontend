define([
    'qwery',
    'common/utils/$',
    'common/utils/mediator',
    'common/modules/discussion/comment-count-widget'
], function (
    qwery,
    $,
    mediator,
    commentCountWidget
) {
    describe('Comment counts', function () {

        var fixtureTrails = '<div class="comment-trails">'
                    + '<comment-count data-discussion-id="/p/3ghv5" data-discussion-closed="true"></comment-count>'
                    + '<comment-count data-discussion-id="/p/3ghx3" data-discussion-closed="true"></comment-count>'
                    + '<comment-count data-discussion-id="/p/3gh4n"></comment-count>'
                    + '</div>';

        var mockFetch = function () {
            return Promise.resolve({
                ok: true,
                json: function () {
                    return {
                        counts: [
                            { id: '/p/3ghv5', count: 0 },
                            { id: '/p/3ghx3', count: 10 },
                            { id: '/p/3gh4n', count: 1000 },
                            { id: '/p/3gh7b', count: 300 }
                        ]
                    };
                }
            });
        };

        beforeEach(function () {
            $('body').append(fixtureTrails);
        });

        afterEach(function () {
            $('.comment-trails').remove();
        });

        it('removes closed discussions with zero comment count, keeping the others', function (done) {
            // TODO dependency injection of ab and comment blocker?
            commentCountWidget.init({ fetch: mockFetch })
            .then(function () {
                expect($('[data-discussion-id="/p/3ghv5"]')[0]).toBeUndefined();
                expect($('[data-discussion-id="/p/3ghx3"]')[0].innerText).toBe('10');
                expect($('[data-discussion-id="/p/3gh4n"]')[0].innerText).toBe('1,000');
            })
            .then(done)
            .catch(done.error);
        });

        it('update the count after emitting an event', function (done) {
            commentCountWidget.init({ fetch: mockFetch })
            .then(function () {
                $('.comment-trails').append('<comment-count data-discussion-id="/p/3gh7b"></comment-count>');

                mediator.emit('modules:related:loaded');
                // TODO wait somehow
            })
            .then(function () {
                expect($('[data-discussion-id="/p/3ghx3"]')[0].innerText).toBe('300');
            })
            .then(done)
            .catch(done.error);
        });
    });
});
