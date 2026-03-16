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
      headings.forEach(function(heading) {
        // Ensure heading has an id
        if (!heading.id) {
          heading.id = heading.textContent.trim()
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        }

        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + heading.id;
        a.textContent = heading.textContent;
        a.setAttribute('data-target', heading.id);

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
});
