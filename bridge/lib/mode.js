/**
 * Starts the appropriate mode based on the provided configuration.
 *
 * @param {Object} options - The options for starting the mode.
 * @param {string} options.mode - The mode to start ('live' or 'replay').
 * @param {Function} options.startReplay - Function to start replay mode.
 * @param {Function} options.startLive - Function to start live mode.
 */
function startMode({ mode, startReplay, startLive }) {
  if (mode === 'live') return startLive();
  return startReplay();
}

module.exports = { startMode };
