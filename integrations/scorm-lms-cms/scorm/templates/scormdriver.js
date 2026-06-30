(function () {
  function findAPI(win) {
    var attempts = 0;
    while (win && attempts < 10) {
      if (win.API) return { api: win.API, version: '1.2' };
      if (win.API_1484_11) return { api: win.API_1484_11, version: '2004' };
      attempts++;
      win = win.parent && win.parent !== win ? win.parent : null;
    }
    if (window.opener) return findAPI(window.opener);
    return { api: null, version: 'standalone' };
  }

  var apiInfo = findAPI(window);
  var api = apiInfo.api;
  var version = apiInfo.version;
  var standaloneStore = {};

  function call(name12, name2004, arg) {
    if (!api) return 'true';
    if (version === '1.2') return api[name12](arg || '');
    return api[name2004](arg || '');
  }

  window.LEASCORM = {
    version: function () { return version; },
    initialize: function () { return call('LMSInitialize', 'Initialize', ''); },
    finish: function () { return call('LMSFinish', 'Terminate', ''); },
    commit: function () { return call('LMSCommit', 'Commit', ''); },
    get: function (key12, key2004) {
      if (!api) return standaloneStore[key12] || standaloneStore[key2004] || '';
      return version === '1.2' ? api.LMSGetValue(key12) : api.GetValue(key2004 || key12);
    },
    set: function (key12, key2004, value) {
      if (!api) { standaloneStore[key12] = value; standaloneStore[key2004] = value; return 'true'; }
      return version === '1.2' ? api.LMSSetValue(key12, String(value)) : api.SetValue(key2004 || key12, String(value));
    },
    setScore: function (score, mastery) {
      this.set('cmi.core.score.raw', 'cmi.score.raw', score);
      this.set('cmi.core.score.min', 'cmi.score.min', 0);
      this.set('cmi.core.score.max', 'cmi.score.max', 100);
      if (version === '1.2') {
        this.set('cmi.core.lesson_status', 'cmi.completion_status', score >= mastery ? 'passed' : 'failed');
      } else {
        this.set('cmi.completion_status', 'cmi.completion_status', 'completed');
        this.set('cmi.success_status', 'cmi.success_status', score >= mastery ? 'passed' : 'failed');
      }
      this.commit();
    },
    setLocation: function (location) { this.set('cmi.core.lesson_location', 'cmi.location', location); },
    setSuspendData: function (data) { this.set('cmi.suspend_data', 'cmi.suspend_data', JSON.stringify(data).slice(0, 3900)); },
  };
})();
