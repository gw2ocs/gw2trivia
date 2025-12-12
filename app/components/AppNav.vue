<template>
    <nav class="layout-nav">
        <ul itemscope itemtype="http://www.schema.org/SiteNavigationElement">
            <li itemprop="name"><NuxtLink to="/" id="nav-home" accesskey="P" itemprop="url">Présentation</NuxtLink></li>
            <li itemprop="name"><NuxtLink to="/questions" id="nav-questions" accesskey="Q" itemprop="url">Questions</NuxtLink></li>
            <li itemprop="name"><NuxtLink to="/articles" id="nav-articles" accesskey="A" itemprop="url">Articles</NuxtLink></li>
            <li itemprop="name"><NuxtLink to="/novels" id="nav-novels" accesskey="R" itemprop="url">Romans</NuxtLink></li>
        </ul>
    </nav>
</template>