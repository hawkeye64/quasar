<template>
  <div class="q-layout-padding run-sequential-promises">
    <div class="text-h5 q-mb-md"
      >requires multiple runs (10+) to capture all outcomes</div
    >
    <q-markup-table separator="cell" flat bordered dense>
      <thead>
        <tr>
          <th class="text-left">Type</th>
          <th class="text-left">Propose</th>
          <th class="text-left">abortOnFail</th>
          <th class="text-left">Threads</th>
          <th class="text-left">Outcome</th>
          <th class="text-left">Return value</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(test, index) in testList" :key="index">
          <td class="text-left">
            <div class="row items-center no-wrap">
              {{ test.type }}
            </div>
          </td>
          <td class="text-left">
            <div class="row items-center no-wrap">
              {{ test.proposed }}
            </div>
          </td>
          <td class="text-left">
            <div class="row items-center no-wrap">
              {{ test.abortOnFail }}
            </div>
          </td>
          <td class="text-left">
            <div class="row items-center no-wrap">
              {{ test.threads }}
            </div>
          </td>
          <td class="text-left" :class="`text-${test.color}`">
            <div class="row items-center no-wrap">
              <q-icon :name="test.icon" />
              <div class="q-ml-sm">{{ test.outcome }}</div>
            </div>
          </td>
          <td class="text-left">
            <div class="row items-center no-wrap">
              <pre>{{ test.result }}</pre>
            </div>
            <div v-if="test.expected">
              <div class="text-weight-bold">({{ test.id }}) -> Expected:</div>
              <pre>{{ test.expected }}</pre>
            </div>
          </td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</template>

<script setup>
import { is, runSequentialPromises } from 'quasar'
import { ref } from 'vue'

const testList = ref([])

function runTest(fixture, runFn) {
  const index = testList.value.length

  testList.value[index] = {
    id: fixture[0], // Unique Human Name
    type: fixture[1],
    proposed: fixture[2],
    abortOnFail: fixture[3],
    threads: fixture[4],

    icon: 'auto_mode',
    outcome: 'running',
    result: '...',
    expected: '',
    color: 'grey'
  }

  runFn((result, success, expected) => {
    Object.assign(testList.value[index], {
      icon: success ? 'done' : 'cancel',
      outcome: success ? 'as expected' : 'FAIL',
      result: JSON.stringify(result),
      expected: success ? '' : JSON.stringify(expected),
      color: success ? 'green' : 'negative'
    })
  })
}

function getPromiseList(name, fail) {
  return [
    resultAggregator =>
      new Promise(resolve => {
        if (resultAggregator.length !== 5) {
          throw new Error(`${name}: resultAggregator is NOT a 5 element array`)
        }

        setTimeout(() => {
          resolve('one')
        }, Math.random() * 1000)
      }),

    () =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (fail) {
            reject('cannot settle promise 2')
          } else {
            resolve('two')
          }
        }, Math.random() * 1000)
      }),

    () =>
      new Promise(resolve => {
        setTimeout(() => {
          resolve('three')
        }, Math.random() * 1000)
      }),

    resultAggregator =>
      new Promise(resolve => {
        if (!Array.isArray(resultAggregator)) {
          throw new TypeError(`${name}: resultAggregator is NOT an array`)
        }

        setTimeout(() => {
          resolve('four')
        }, Math.random() * 1000)
      }),

    resultAggregator =>
      new Promise(resolve => {
        const firstPromiseResult = resultAggregator[0]
        if (firstPromiseResult) {
          if (firstPromiseResult.status !== 'fulfilled') {
            throw new Error(
              `${name}: resultAggregator has wrong status for first promise -> ${firstPromiseResult.status}`
            )
          } else if (firstPromiseResult.value !== 'one') {
            throw new Error(
              `${name}: resultAggregator does NOT have correct value for first promise -> ${firstPromiseResult.value}`
            )
          }
        }

        setTimeout(() => {
          resolve('five')
        }, Math.random() * 1000)
      })
  ]
}

function getPromiseMap(name, fail) {
  return {
    one: resultAggregator =>
      new Promise(resolve => {
        if (Object.keys(resultAggregator).length !== 5) {
          throw new Error(
            `${name}: resultAggregator is NOT a 5 element mapping`
          )
        }

        setTimeout(() => {
          resolve('one')
        }, Math.random() * 1000)
      }),

    two: () =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (fail) {
            reject('cannot settle promise 2')
          } else {
            resolve('two')
          }
        }, Math.random() * 1000)
      }),

    three: () =>
      new Promise(resolve => {
        setTimeout(() => {
          resolve('three')
        }, Math.random() * 1000)
      }),

    four: resultAggregator =>
      new Promise(resolve => {
        if (
          Array.isArray(resultAggregator) ||
          Object(resultAggregator) !== resultAggregator
        ) {
          throw new Error(`${name}: resultAggregator is NOT a mapped object`)
        }

        setTimeout(() => {
          resolve('four')
        }, Math.random() * 1000)
      }),

    five: resultAggregator =>
      new Promise(resolve => {
        if (resultAggregator.one) {
          if (resultAggregator.one.status !== 'fulfilled') {
            throw new Error(
              `${name}: resultAggregator has wrong status for first promise -> ${resultAggregator.one.status}`
            )
          } else if (resultAggregator.one.value !== 'one') {
            throw new Error(
              `${name}: resultAggregator does NOT have correct value for first promise -> ${resultAggregator.one.value}`
            )
          }
        }

        setTimeout(() => {
          resolve('five')
        }, Math.random() * 1000)
      })
  }
}

function isFailureEqualWithThreadsAndAbortOnFail(result, expected) {
  const { resultAggregator, ...rest } = result
  const { resultAggregator: expectedResultAggregator, ...expectedRest } =
    expected

  if (!is.deepEqual(rest, expectedRest)) return false

  if (Array.isArray(expectedResultAggregator)) {
    if (!Array.isArray(resultAggregator)) return false
    if (resultAggregator.length !== expectedResultAggregator.length) {
      return false
    }

    if (!is.deepEqual(resultAggregator[1], expectedResultAggregator[1])) {
      return false
    }
  } else {
    if (
      Array.isArray(resultAggregator) ||
      Object(resultAggregator) !== resultAggregator
    ) {
      return false
    }

    const expectedKeys = Object.keys(expectedResultAggregator)
    const resultKeys = Object.keys(resultAggregator)

    if (expectedKeys.length !== resultKeys.length) return false

    if (!is.deepEqual(resultAggregator.two, expectedResultAggregator.two)) {
      return false
    }
  }

  return true
}

/**
 * LIST TESTS
 */

runTest(['LIST_BASIC_SYNC', 'list', 'resolve all', 'yes', 1], setResult => {
  const expected = [
    { key: 0, status: 'fulfilled', value: 'one' },
    { key: 1, status: 'fulfilled', value: 'two' },
    { key: 2, status: 'fulfilled', value: 'three' },
    { key: 3, status: 'fulfilled', value: 'four' },
    { key: 4, status: 'fulfilled', value: 'five' }
  ]
  runSequentialPromises(getPromiseList('LIST_BASIC_SYNC'), {
    abortOnFail: true
  })
    .then(list => setResult(list, is.deepEqual(list, expected), expected))
    .catch(err => setResult(err, false, expected))
})

runTest(['LIST_CONTINUE_ON_FAIL', 'list', 'resolve all', '-', 1], setResult => {
  const expected = [
    { key: 0, status: 'fulfilled', value: 'one' },
    { key: 1, status: 'fulfilled', value: 'two' },
    { key: 2, status: 'fulfilled', value: 'three' },
    { key: 3, status: 'fulfilled', value: 'four' },
    { key: 4, status: 'fulfilled', value: 'five' }
  ]
  runSequentialPromises(getPromiseList('LIST_CONTINUE_ON_FAIL'), {
    abortOnFail: false
  })
    .then(list => setResult(list, is.deepEqual(list, expected), expected))
    .catch(err => setResult(err, false, expected))
})

runTest(
  ['LIST_MULTI_THREAD_ABORT', 'list', 'resolve all', 'yes', 2],
  setResult => {
    const expected = [
      { key: 0, status: 'fulfilled', value: 'one' },
      { key: 1, status: 'fulfilled', value: 'two' },
      { key: 2, status: 'fulfilled', value: 'three' },
      { key: 3, status: 'fulfilled', value: 'four' },
      { key: 4, status: 'fulfilled', value: 'five' }
    ]
    runSequentialPromises(getPromiseList('LIST_MULTI_THREAD_ABORT'), {
      abortOnFail: true,
      threadsNumber: 2
    })
      .then(list => setResult(list, is.deepEqual(list, expected), expected))
      .catch(err => setResult(err, false, expected))
  }
)

runTest(
  ['LIST_MULTI_THREAD_CONTINUE', 'list', 'resolve all', '-', 2],
  setResult => {
    const expected = [
      { key: 0, status: 'fulfilled', value: 'one' },
      { key: 1, status: 'fulfilled', value: 'two' },
      { key: 2, status: 'fulfilled', value: 'three' },
      { key: 3, status: 'fulfilled', value: 'four' },
      { key: 4, status: 'fulfilled', value: 'five' }
    ]
    runSequentialPromises(getPromiseList('LIST_MULTI_THREAD_CONTINUE'), {
      abortOnFail: false,
      threadsNumber: 2
    })
      .then(list => setResult(list, is.deepEqual(list, expected), expected))
      .catch(err => setResult(err, false, expected))
  }
)

runTest(
  ['LIST_SINGLE_THREAD_REJECT', 'list', 'reject 2nd', 'yes', 1],
  setResult => {
    const expected = {
      key: 1,
      status: 'rejected',
      reason: 'cannot settle promise 2',
      resultAggregator: [
        { key: 0, status: 'fulfilled', value: 'one' },
        { key: 1, status: 'rejected', reason: 'cannot settle promise 2' },
        null,
        null,
        null
      ]
    }
    runSequentialPromises(getPromiseList('LIST_SINGLE_THREAD_REJECT', true), {
      abortOnFail: true
    })
      .then(list => setResult(list, false, expected))
      .catch(err => setResult(err, is.deepEqual(err, expected), expected))
  }
)

runTest(
  ['LIST_SINGLE_THREAD_IGNORE_FAIL', 'list', 'reject 2nd', '-', 1],
  setResult => {
    const expected = [
      { key: 0, status: 'fulfilled', value: 'one' },
      { key: 1, status: 'rejected', reason: 'cannot settle promise 2' },
      { key: 2, status: 'fulfilled', value: 'three' },
      { key: 3, status: 'fulfilled', value: 'four' },
      { key: 4, status: 'fulfilled', value: 'five' }
    ]
    runSequentialPromises(
      getPromiseList('LIST_SINGLE_THREAD_IGNORE_FAIL', true),
      { abortOnFail: false }
    )
      .then(list => setResult(list, is.deepEqual(list, expected), expected))
      .catch(err => setResult(err, false, expected))
  }
)

runTest(
  ['LIST_MULTI_THREAD_REJECT', 'list', 'reject 2nd', 'yes', 2],
  setResult => {
    const expected = {
      key: 1,
      status: 'rejected',
      reason: 'cannot settle promise 2',
      resultAggregator: [
        { key: 0, status: 'fulfilled', value: 'one' },
        { key: 1, status: 'rejected', reason: 'cannot settle promise 2' },
        null,
        null,
        null
      ]
    }
    runSequentialPromises(getPromiseList('LIST_MULTI_THREAD_REJECT', true), {
      abortOnFail: true,
      threadsNumber: 2
    })
      .then(list => setResult(list, false, expected))
      .catch(err =>
        setResult(
          err,
          isFailureEqualWithThreadsAndAbortOnFail(err, expected),
          expected
        )
      )
  }
)

runTest(
  ['LIST_MULTI_THREAD_IGNORE_FAIL', 'list', 'reject 2nd', '-', 2],
  setResult => {
    const expected = [
      { key: 0, status: 'fulfilled', value: 'one' },
      { key: 1, status: 'rejected', reason: 'cannot settle promise 2' },
      { key: 2, status: 'fulfilled', value: 'three' },
      { key: 3, status: 'fulfilled', value: 'four' },
      { key: 4, status: 'fulfilled', value: 'five' }
    ]
    runSequentialPromises(
      getPromiseList('LIST_MULTI_THREAD_IGNORE_FAIL', true),
      {
        abortOnFail: false,
        threadsNumber: 2
      }
    )
      .then(list => setResult(list, is.deepEqual(list, expected), expected))
      .catch(err => setResult(err, false, expected))
  }
)

/**
 * MAP TESTS
 */

runTest(['MAP_BASIC_SYNC', 'map', 'resolve all', 'yes', 1], setResult => {
  const expected = {
    one: { key: 'one', status: 'fulfilled', value: 'one' },
    two: { key: 'two', status: 'fulfilled', value: 'two' },
    three: { key: 'three', status: 'fulfilled', value: 'three' },
    four: { key: 'four', status: 'fulfilled', value: 'four' },
    five: { key: 'five', status: 'fulfilled', value: 'five' }
  }
  runSequentialPromises(getPromiseMap('MAP_BASIC_SYNC'), { abortOnFail: true })
    .then(res => setResult(res, is.deepEqual(res, expected), expected))
    .catch(err => setResult(err, false, expected))
})

runTest(['MAP_CONTINUE_ON_FAIL', 'map', 'resolve all', '-', 1], setResult => {
  const expected = {
    one: { key: 'one', status: 'fulfilled', value: 'one' },
    two: { key: 'two', status: 'fulfilled', value: 'two' },
    three: { key: 'three', status: 'fulfilled', value: 'three' },
    four: { key: 'four', status: 'fulfilled', value: 'four' },
    five: { key: 'five', status: 'fulfilled', value: 'five' }
  }
  runSequentialPromises(getPromiseMap('MAP_CONTINUE_ON_FAIL'), {
    abortOnFail: false
  })
    .then(res => setResult(res, is.deepEqual(res, expected), expected))
    .catch(err => setResult(err, false, expected))
})

runTest(
  ['MAP_MULTI_THREAD_ABORT', 'map', 'resolve all', 'yes', 2],
  setResult => {
    const expected = {
      one: { key: 'one', status: 'fulfilled', value: 'one' },
      two: { key: 'two', status: 'fulfilled', value: 'two' },
      three: { key: 'three', status: 'fulfilled', value: 'three' },
      four: { key: 'four', status: 'fulfilled', value: 'four' },
      five: { key: 'five', status: 'fulfilled', value: 'five' }
    }
    runSequentialPromises(getPromiseMap('MAP_MULTI_THREAD_ABORT'), {
      abortOnFail: true,
      threadsNumber: 2
    })
      .then(res => setResult(res, is.deepEqual(res, expected), expected))
      .catch(err => setResult(err, false, expected))
  }
)

runTest(
  ['MAP_MULTI_THREAD_CONTINUE', 'map', 'resolve all', '-', 2],
  setResult => {
    const expected = {
      one: { key: 'one', status: 'fulfilled', value: 'one' },
      two: { key: 'two', status: 'fulfilled', value: 'two' },
      three: { key: 'three', status: 'fulfilled', value: 'three' },
      four: { key: 'four', status: 'fulfilled', value: 'four' },
      five: { key: 'five', status: 'fulfilled', value: 'five' }
    }
    runSequentialPromises(getPromiseMap('MAP_MULTI_THREAD_CONTINUE'), {
      abortOnFail: false,
      threadsNumber: 2
    })
      .then(res => setResult(res, is.deepEqual(res, expected), expected))
      .catch(err => setResult(err, false, expected))
  }
)

runTest(
  ['MAP_SINGLE_THREAD_REJECT', 'map', 'reject 2nd', 'yes', 1],
  setResult => {
    const expected = {
      key: 'two',
      status: 'rejected',
      reason: 'cannot settle promise 2',
      resultAggregator: {
        one: { key: 'one', status: 'fulfilled', value: 'one' },
        two: {
          key: 'two',
          status: 'rejected',
          reason: 'cannot settle promise 2'
        },
        three: null,
        four: null,
        five: null
      }
    }
    runSequentialPromises(getPromiseMap('MAP_SINGLE_THREAD_REJECT', true), {
      abortOnFail: true
    })
      .then(res => setResult(res, false, expected))
      .catch(err =>
        setResult(
          err,
          isFailureEqualWithThreadsAndAbortOnFail(err, expected),
          expected
        )
      )
  }
)

runTest(
  ['MAP_SINGLE_THREAD_IGNORE_FAIL', 'map', 'reject 2nd', '-', 1],
  setResult => {
    const expected = {
      one: { key: 'one', status: 'fulfilled', value: 'one' },
      two: {
        key: 'two',
        status: 'rejected',
        reason: 'cannot settle promise 2'
      },
      three: { key: 'three', status: 'fulfilled', value: 'three' },
      four: { key: 'four', status: 'fulfilled', value: 'four' },
      five: { key: 'five', status: 'fulfilled', value: 'five' }
    }
    runSequentialPromises(
      getPromiseMap('MAP_SINGLE_THREAD_IGNORE_FAIL', true),
      { abortOnFail: false }
    )
      .then(res => setResult(res, is.deepEqual(res, expected), expected))
      .catch(err => setResult(err, false, expected))
  }
)

runTest(
  ['MAP_MULTI_THREAD_REJECT', 'map', 'reject 2nd', 'yes', 2],
  setResult => {
    const expected = {
      key: 'two',
      status: 'rejected',
      reason: 'cannot settle promise 2',
      resultAggregator: {
        one: { key: 'one', status: 'fulfilled', value: 'one' },
        two: {
          key: 'two',
          status: 'rejected',
          reason: 'cannot settle promise 2'
        },
        three: null,
        four: null,
        five: null
      }
    }
    runSequentialPromises(getPromiseMap('MAP_MULTI_THREAD_REJECT', true), {
      abortOnFail: true,
      threadsNumber: 2
    })
      .then(res => setResult(res, false, expected))
      .catch(err =>
        setResult(
          err,
          isFailureEqualWithThreadsAndAbortOnFail(err, expected),
          expected
        )
      )
  }
)

runTest(
  ['MAP_MULTI_THREAD_IGNORE_FAIL', 'map', 'reject 2nd', '-', 2],
  setResult => {
    const expected = {
      one: { key: 'one', status: 'fulfilled', value: 'one' },
      two: {
        key: 'two',
        status: 'rejected',
        reason: 'cannot settle promise 2'
      },
      three: { key: 'three', status: 'fulfilled', value: 'three' },
      four: { key: 'four', status: 'fulfilled', value: 'four' },
      five: { key: 'five', status: 'fulfilled', value: 'five' }
    }
    runSequentialPromises(getPromiseMap('MAP_MULTI_THREAD_IGNORE_FAIL', true), {
      abortOnFail: false,
      threadsNumber: 2
    })
      .then(res => setResult(res, is.deepEqual(res, expected), expected))
      .catch(err => setResult(err, false, expected))
  }
)
</script>

<style lang="sass">
.run-sequential-promises
  pre
    margin: 0
    font-size: 9px
</style>
