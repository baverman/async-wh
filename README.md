Async helper
============

Yeah we all know about Promise/* implementations. But in real life
we have to deal with promiseunaware code/libs and thats turns into endless
pain, completely unreadable wrapped wrappers macaroni.

So explicit callbacks is not a bad thing for now.

Asynch tries to solve a common flow problem — you have a bunch of functions.
Some of them can be run in parallel, others depend from previous results.
There is not a problem to directly call async#auto in simple cases. But what
about case when you need run parallel tasks after getting result from another
parallel tasks? Hello callbacks hell! Asynch allows to linearize such code.

    asynch
    .parallel('res1', getRes1)
    .parallel('res2', getRes2)
    .sync('res3', transformRes1Res2IntoRes3)
    .parallel(useOfRes3)
    .parallel(anotherUseOfRes3)
    .done(done)
