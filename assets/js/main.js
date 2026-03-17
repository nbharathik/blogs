// Theme toggle
function toggleTheme() {
  var html = document.documentElement;
  var current = html.getAttribute('data-theme');
  var next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);

  // Update utterances theme if present
  var utterancesFrame = document.querySelector('.utterances-frame');
  if (utterancesFrame) {
    utterancesFrame.contentWindow.postMessage(
      { type: 'set-theme', theme: next === 'dark' ? 'github-dark' : 'github-light' },
      'https://utteranc.es'
    );
  }
}

function slugifyText(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

document.addEventListener('DOMContentLoaded', function() {
  // Copy code button
  document.querySelectorAll('.post-content pre').forEach(function(pre) {
    var btn = document.createElement('button');
    btn.className = 'code-copy-btn';
    btn.textContent = 'Copy';
    btn.addEventListener('click', function() {
      var code = pre.querySelector('code');
      var text = code ? code.textContent : pre.textContent;
      navigator.clipboard.writeText(text).then(function() {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(function() {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      });
    });
    pre.style.position = 'relative';
    pre.appendChild(btn);
  });

  // Auto-generate sidebar TOC from post headings
  var tocList = document.getElementById('toc-list');
  var tocSidebar = document.getElementById('toc-sidebar');
  if (tocList && tocSidebar) {
    var headings = document.querySelectorAll('.post-content h2, .post-content h3, .post-content h4');

    if (headings.length < 2) {
      // Hide TOC if fewer than 2 headings
      tocSidebar.style.display = 'none';
    } else {
      var reservedIds = new Set();
      document.querySelectorAll('.post-content [id]').forEach(function(node) {
        if (!/^H[2-4]$/.test(node.tagName)) {
          reservedIds.add(node.id);
        }
      });

      var seenIds = new Set();

      headings.forEach(function(heading, idx) {
        var existingId = (heading.id || '').trim();
        var uniqueId = '';

        if (existingId && !seenIds.has(existingId) && !reservedIds.has(existingId)) {
          uniqueId = existingId;
        } else {
          var baseId = slugifyText(heading.textContent) || ('section-' + (idx + 1));
          uniqueId = baseId;
          var suffix = 2;
          while (seenIds.has(uniqueId) || reservedIds.has(uniqueId)) {
            uniqueId = baseId + '-' + suffix;
            suffix += 1;
          }
        }

        if (heading.id !== uniqueId) {
          heading.id = uniqueId;
        }
        seenIds.add(uniqueId);

        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + uniqueId;
        a.textContent = heading.textContent;
        a.setAttribute('data-target', uniqueId);

        // Add depth class
        var tag = heading.tagName.toLowerCase();
        a.classList.add('toc-' + tag);

        li.appendChild(a);
        tocList.appendChild(li);
      });

      // Smooth scroll for sidebar TOC links
      tocList.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
          e.preventDefault();
          var targetId = e.target.getAttribute('data-target');
          var target = document.getElementById(targetId);
          if (target) {
            var offset = 80; // nav height
            var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: top, behavior: 'smooth' });
            history.pushState(null, null, '#' + targetId);
          }
        }
      });

      // Scroll spy: highlight active TOC item
      var tocLinks = tocList.querySelectorAll('a');
      var headingsArr = Array.from(headings);

      function updateActiveLink() {
        var scrollPos = window.scrollY + 100;
        var current = null;

        for (var i = headingsArr.length - 1; i >= 0; i--) {
          if (headingsArr[i].offsetTop <= scrollPos) {
            current = headingsArr[i].id;
            break;
          }
        }

        tocLinks.forEach(function(link) {
          if (link.getAttribute('data-target') === current) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }

      window.addEventListener('scroll', updateActiveLink, { passive: true });
      updateActiveLink();
    }
  }

  // Categories page explorer: filters + pagination + query params
  var explorer = document.getElementById('all-posts-explorer');
  if (explorer) {
    var list = document.getElementById('all-posts-list');
    var resultText = document.getElementById('all-posts-results');
    var prevBtn = document.getElementById('all-post-prev');
    var nextBtn = document.getElementById('all-post-next');
    var pageInfo = document.getElementById('all-post-page-info');
    var filterButtons = Array.from(document.querySelectorAll('.category-filter'));

    if (list && resultText && prevBtn && nextBtn && pageInfo && filterButtons.length > 0) {
      var posts = Array.from(list.querySelectorAll('.all-post-item'));
      var pageSize = parseInt(explorer.getAttribute('data-page-size') || '100', 10);
      if (!Number.isFinite(pageSize) || pageSize <= 0) {
        pageSize = 100;
      }

      var availableCategories = new Set(filterButtons.map(function(btn) {
        return btn.getAttribute('data-category');
      }));

      var params = new URLSearchParams(window.location.search);
      var rawCategory = params.get('category') || 'all';
      var initialCategory = rawCategory === 'all' ? 'all' : slugifyText(rawCategory);
      if (!availableCategories.has(initialCategory)) {
        initialCategory = 'all';
      }

      var initialPage = parseInt(params.get('page') || '1', 10);
      if (!Number.isFinite(initialPage) || initialPage < 1) {
        initialPage = 1;
      }

      var state = {
        category: initialCategory,
        page: initialPage
      };

      function updateUrl() {
        var query = new URLSearchParams(window.location.search);

        if (state.category && state.category !== 'all') {
          query.set('category', state.category);
        } else {
          query.delete('category');
        }

        if (state.page > 1) {
          query.set('page', String(state.page));
        } else {
          query.delete('page');
        }

        var next = query.toString();
        var nextUrl = next ? window.location.pathname + '?' + next : window.location.pathname;
        history.replaceState(null, '', nextUrl);
      }

      function getFilteredPosts() {
        return posts.filter(function(postEl) {
          if (state.category === 'all') {
            return true;
          }
          var categories = (postEl.getAttribute('data-categories') || '')
            .split(',')
            .map(function(v) { return v.trim(); })
            .filter(Boolean);
          return categories.indexOf(state.category) !== -1;
        });
      }

      function render(updateQuery) {
        var filtered = getFilteredPosts();
        var total = filtered.length;
        var totalPages = Math.max(1, Math.ceil(total / pageSize));

        if (state.page > totalPages) {
          state.page = totalPages;
        }
        if (state.page < 1) {
          state.page = 1;
        }

        var start = (state.page - 1) * pageSize;
        var end = Math.min(start + pageSize, total);
        var visible = filtered.slice(start, end);

        posts.forEach(function(postEl) {
          postEl.style.display = 'none';
        });
        visible.forEach(function(postEl) {
          postEl.style.display = '';
        });

        filterButtons.forEach(function(btn) {
          var isActive = btn.getAttribute('data-category') === state.category;
          btn.classList.toggle('active', isActive);
        });

        var selectedBtn = filterButtons.find(function(btn) {
          return btn.getAttribute('data-category') === state.category;
        });
        var selectedLabel = selectedBtn ? selectedBtn.textContent.replace(/\s+\d+\s*$/, '').trim() : 'All Posts';

        if (total === 0) {
          resultText.textContent = 'No posts found for "' + selectedLabel + '".';
        } else {
          resultText.textContent = 'Showing ' + (start + 1) + '-' + end + ' of ' + total + ' posts in "' + selectedLabel + '".';
        }

        pageInfo.textContent = 'Page ' + state.page + ' of ' + totalPages;
        prevBtn.disabled = state.page <= 1;
        nextBtn.disabled = state.page >= totalPages;

        if (updateQuery) {
          updateUrl();
        }
      }

      filterButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
          var category = btn.getAttribute('data-category') || 'all';
          if (category !== state.category) {
            state.category = category;
            state.page = 1;
            render(true);
          }
        });
      });

      prevBtn.addEventListener('click', function() {
        if (state.page > 1) {
          state.page -= 1;
          render(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });

      nextBtn.addEventListener('click', function() {
        state.page += 1;
        render(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      render(false);
    }
  }

});
