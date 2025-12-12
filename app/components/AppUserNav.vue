<template>
    <nav class="user-nav">
        <ul>
            <li id="login-link">
                <a href="/login" id="nav-login">
                    <i class="gw2-game-menu-edit-account"></i>
                    Se connecter
                </a>
            </li>
            <li id="profile-link" hidden>
                <a href="#" id="nav-profile" alt="Profil">
                    <span class="user user-card-small">
                        <img class="user-avatar"/>
                        <span class="user-name"></span>
                    </span>
                </a>
            </li>
            <li id="logout-link" hidden>
                <a href="/logout" id="nav-logout">
                    <i class="gw2-game-menu-log-out"></i>
                    Se déconnecter
                </a>
            </li>
            <li id="theme-link">
                <button type="button" class="toggle-theme">
                    <i class="mdi mdi-theme-light-dark"></i>
                </button>
            </li>
        </ul>
    </nav>
</template>