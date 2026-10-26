const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new RequestCancelledError());
      return;
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    function onAbort() {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      reject(new RequestCancelledError());
    }

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function isRetryable(error) {
  if (error instanceof NetworkError || error instanceof TimeoutError) {
    return true;
  }

  return (
    error instanceof HttpError &&
    RETRYABLE_STATUSES.has(error.status)
  );
}

export async function fetchJsonWithRetry(
  url,
  {
    timeoutMs = 1000,
    maxAttempts = 3,
    baseDelayMs = 100,
    signal
  } = {}
) {
  if (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 5) {
    throw new Error("maxAttempts must be an integer between 1 and 5.");
  }

  if (!Number.isSafeInteger(baseDelayMs) || baseDelayMs < 0) {
    throw new Error("baseDelayMs must be a non-negative safe integer.");
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (signal?.aborted) {
      throw new RequestCancelledError();
    }

    try {
      return await fetchJson(url, { timeoutMs, signal });
    } catch (error) {
      if (!isRetryable(error) || attempt === maxAttempts) {
        throw error;
      }

      // Exponential backoff: baseDelayMs, then 2 * baseDelayMs, etc.
      const delayMs = baseDelayMs * (2 ** (attempt - 1));
      await sleep(delayMs, signal);
    }
  }

  // Defensive fallback; the loop always returns or throws.
  throw new Error("Retry loop ended unexpectedly.");
}