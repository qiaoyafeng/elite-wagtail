function createMobileMenu() {
    /**
     * Dynamically create a mobile menu from all specified mobile links
     * on the page.
     */
    'use strict';
    $('.mobile-nav-item').each(function() {
        var mobileNavItem = $(this).clone().addClass('mobile-nav-link');
        mobileNavItem.removeAttr('role');
        mobileNavItem.find('a').attr('role', 'menuitem');
        // xss-lint: disable=javascript-jquery-append
        $('.mobile-menu').append(mobileNavItem);
    });
}

$(document).ready(function() {
    'use strict';
    var $hamburgerMenu;
    var $mobileMenu;
    // Toggling visibility for the user dropdown
    $('.global-header .toggle-user-dropdown, .global-header .toggle-user-dropdown span').click(function(e) {
        var $dropdownMenu = $('.global-header .nav-item .dropdown-user-menu');
        var $userDropdown = $('.global-header .toggle-user-dropdown');
        if ($dropdownMenu.is(':visible')) {
            $dropdownMenu.addClass('hidden');
            $userDropdown.attr('aria-expanded', 'false');
        } else {
            $dropdownMenu.removeClass('hidden');
            $dropdownMenu.find('.dropdown-item')[0].focus();
            $userDropdown.attr('aria-expanded', 'true');
        }
        $('.global-header .toggle-user-dropdown').toggleClass('open');
        e.stopPropagation();
    });

    // Hide user dropdown on click away
    if ($('.global-header .nav-item .dropdown-user-menu').length) {
        $(window).click(function(e) {
            var $dropdownMenu = $('.global-header .nav-item .dropdown-user-menu');
            var $userDropdown = $('.global-header .toggle-user-dropdown');
            if ($userDropdown.is(':visible') && !$(e.target).is('.dropdown-item, .toggle-user-dropdown')) {
                $dropdownMenu.addClass('hidden');
                $userDropdown.attr('aria-expanded', 'false');
            }
        });
    }

    // Toggling menu visibility with the hamburger menu
    $('.global-header .hamburger-menu').click(function() {
        $hamburgerMenu = $('.global-header .hamburger-menu');
        $mobileMenu = $('.mobile-menu');
        if ($mobileMenu.is(':visible')) {
            $mobileMenu.addClass('hidden');
            $hamburgerMenu.attr('aria-expanded', 'false');
        } else {
            $mobileMenu.removeClass('hidden');
            $hamburgerMenu.attr('aria-expanded', 'true');
        }
        $hamburgerMenu.toggleClass('open');
    });

    // Hide hamburger menu if no nav items (sign in and register pages)
    if ($('.mobile-nav-item').size() === 0) {
        $('.global-header .hamburger-menu').addClass('hidden');
    }

    // createMobileMenu();
});


// Accessibility keyboard controls for user dropdown and mobile menu
$('.mobile-menu, .global-header').on('keydown', function(e) {
    'use strict';
    var isNext,
        nextLink,
        loopFirst,
        loopLast,
        $curTarget = $(e.target),
        isLastItem = $curTarget.parent().is(':last-child'),
        isToggle = $curTarget.hasClass('toggle-user-dropdown'),
        isHamburgerMenu = $curTarget.hasClass('hamburger-menu'),
        isMobileOption = $curTarget.parent().hasClass('mobile-nav-link'),
        isDropdownOption = !isMobileOption && $curTarget.parent().hasClass('dropdown-item'),
        $userDropdown = $('.global-header .user-dropdown'),
        $hamburgerMenu = $('.global-header .hamburger-menu'),
        $toggleUserDropdown = $('.global-header .toggle-user-dropdown');

    // Open or close relevant menu on enter or space click and focus on first element.
    if ((e.key === 'Enter' || e.key === 'Space') && (isToggle || isHamburgerMenu)) {
        e.preventDefault();
        e.stopPropagation();

        $curTarget.click();
        if (isHamburgerMenu) {
            if ($('.mobile-menu').is(':visible')) {
                $hamburgerMenu.attr('aria-expanded', true);
                $('.mobile-menu .mobile-nav-link a').first().focus();
            } else {
                $hamburgerMenu.attr('aria-expanded', false);
            }
        } else if (isToggle) {
            if ($('.global-header .nav-item .dropdown-user-menu').is(':visible')) {
                $userDropdown.attr('aria-expanded', 'true');
                $('.global-header .dropdown-item a:first').focus();
            } else {
                $userDropdown.attr('aria-expanded', false);
            }
        }
    }

    // Enable arrow functionality within the menu.
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && (isDropdownOption || isMobileOption ||
        (isHamburgerMenu && $hamburgerMenu.hasClass('open')) || isToggle && $toggleUserDropdown.hasClass('open'))) {
        isNext = e.key === 'ArrowDown';
        if (isNext && !isHamburgerMenu && !isToggle && isLastItem) {
            // Loop to the start from the final element
            nextLink = isDropdownOption ? $toggleUserDropdown : $hamburgerMenu;
        } else if (!isNext && (isHamburgerMenu || isToggle)) {
            // Loop to the end when up arrow pressed from menu icon
            nextLink = isHamburgerMenu ? $('.mobile-menu .mobile-nav-link a').last()
                : $('.global-header .dropdown-user-menu .dropdown-nav-item').last().find('a');
        } else if (isNext && (isHamburgerMenu || isToggle)) {
            // Loop to the first element from the menu icon
            nextLink = isHamburgerMenu ? $('.mobile-menu .mobile-nav-link a').first()
                : $('.global-header .dropdown-user-menu .dropdown-nav-item').first().find('a');
        } else {
            // Loop up to the menu icon if first element in menu
            if (!isNext && $curTarget.parent().is(':first-child') && !isHamburgerMenu && !isToggle) {
                nextLink = isDropdownOption ? $toggleUserDropdown : $hamburgerMenu;
            } else {
                nextLink = isNext ?
                    $curTarget.parent().next().find('a') : // eslint-disable-line newline-per-chained-call
                    $curTarget.parent().prev().find('a'); // eslint-disable-line newline-per-chained-call
            }
        }
        nextLink.focus();

        // Don't let the screen scroll on navigation
        e.preventDefault();
        e.stopPropagation();
    }

    // Escape clears out of the menu
    if (e.key === 'Escape' && (isDropdownOption || isHamburgerMenu || isMobileOption || isToggle)) {
        if (isDropdownOption || isToggle) {
            $('.global-header .nav-item .dropdown-user-menu').addClass('hidden');
            $toggleUserDropdown.focus()
                .attr('aria-expanded', 'false');
            $('.global-header .toggle-user-dropdown').removeClass('open');
        } else {
            $('.mobile-menu').addClass('hidden');
            $hamburgerMenu.focus()
                .attr('aria-expanded', 'false')
                .removeClass('open');
        }
    }

    // Loop when tabbing and using arrows
    if ((e.key === 'Tab') && ((isDropdownOption && isLastItem) || (isMobileOption && isLastItem) || (isHamburgerMenu
        && $hamburgerMenu.hasClass('open')) || (isToggle && $toggleUserDropdown.hasClass('open')))) {
        nextLink = null;
        loopFirst = isLastItem && !e.shiftKey && !isHamburgerMenu && !isToggle;
        loopLast = (isHamburgerMenu || isToggle) && e.shiftKey;
        if (!(loopFirst || loopLast)) {
            return;
        }
        e.preventDefault();
        if (isDropdownOption || isToggle) {
            nextLink = loopFirst ? $toggleUserDropdown :
                $('.global-header .dropdown-user-menu .dropdown-nav-item a').last();
        } else {
            nextLink = loopFirst ? $hamburgerMenu : $('.mobile-menu .mobile-nav-link a').last();
        }
        nextLink.focus();
    }
});
$('.return-top').click(function(){
    $('html ,body').animate({scrollTop: 0}, 300);
});
$(document).ready(function(){
    $(window).scroll(function(){
        var top = $(document).scrollTop();
        if (top > 0){
            if ($('.return-top').hasClass('hidden')){
                $('.return-top').removeClass('hidden');
            }
        } else{
            $('.return-top').addClass('hidden');
        }
    })
    

    var isLoggedin = $.cookie('edxloggedin');

    if (isLoggedin){
        var userInfo = $.cookie('edx-user-info');
        var info = JSON.parse(userInfo.replace(/\\054/g, ','));

        $('.secondary.login').show();
        $('.secondary.logout').hide();
        $('.nav-item .username').html(info.username) // set name
        $('.user-url').attr('href', '/u/'+info.username)
        $('.user-image-frame').attr('src', info.profile_image_url);

        // 哈商
        var hmm_url = $.cookie('hmm_url');
        var hmm_expiry_date = $.cookie('hmm_expiry_date');
        if (hmm_url && hmm_expiry_date){
            var style = document.createElement('style');
            var css = ".nav-tab-harvard .tab-nav-link{text-align:center;position:relative;top:-9px}.nav-tab-harvard .tab-nav-link span{display:block}.nav-tab-harvard .tab-nav-link span:last-child{font-size:12px;color:#999}@media screen and (max-width:992px){.nav-tab-harvard:hover .tab-nav-link span:last-child{color:#fff}.nav-tab-harvard .tab-nav-link{text-align:left;position:static}.nav-tab-harvard .tab-nav-link span{display:inline-block}.nav-tab-harvard .tab-nav-link span:last-child{float:right;font-size:14px}}";
            if(style.styleSheet){
                style.styleSheet.cssText = css;
            }else{
                style.appendChild(document.createTextNode(css));
            }
            document.getElementsByTagName('head')[0].appendChild(style);

            var a = '<div class="mobile-nav-item hidden-mobile nav-item nav-tab nav-tab-harvard"><a class="tab-nav-link" href="' + 
            hmm_url + '"><span>' + gettext('哈佛管理导师') + '</span><span>' + gettext('有效期至：') + hmm_expiry_date + '</span></a></div>'
            $('.global-header .main').append(a);
        }

        // 置空
        $('.mobile-menu').html('');
        createMobileMenu()
        $('.mobile-menu .mobile-nav-item').each(function(){
            if($(this).find('A').hasClass('sign-in-btn')||$(this).find('A').hasClass('register-btn')){
                $(this).hide()
            }
        })
        
    } else{
        $('.secondary.login').hide();
        $('.secondary.logout').show();
    }
})