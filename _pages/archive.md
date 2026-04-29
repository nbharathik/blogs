---
layout: default
title: Archive
permalink: /archive
---

<div class="container">
  <section class="archive-section">
    <h1>Archive</h1>
    <p class="archive-desc">Older articles and past writings.</p>

    <ul class="post-list">
      {% assign archived_posts = site.posts | where: "archived", true %}
      {% for post in archived_posts %}
        {% include post-card.html %}
      {% endfor %}
    </ul>
  </section>
</div>
