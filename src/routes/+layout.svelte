<script>
    import {
        Alert,
        Button,
        Collapse,
        Dropdown,
        DropdownItem,
        DropdownMenu,
        DropdownToggle,
        Modal,
        ModalBody,
        ModalFooter,
        ModalHeader,
        Nav,
        Navbar,
        NavbarBrand,
        NavbarToggler,
        NavItem,
        NavLink
    } from '@sveltestrap/sveltestrap';
    import {onDestroy} from 'svelte';
    import {alertData} from '../stores.js';
    import {afterNavigate, goto} from '$app/navigation';
    import {base} from '$app/paths';
    import {userData} from "$lib/auth.js";

    let userDataValue;
    let alertDataValue;
    let isOpen = false;
    let modalOpen = false;

    const toggleNavbar = () => {
        isOpen = !isOpen;
    };

    const toggleModal = () => {
        modalOpen = !modalOpen;
    };

    const unsubscribeUserData = userData.subscribe((value) => {
        userDataValue = value;
    });

    const unsubscribeAlertData = alertData.subscribe((value) => {
        alertDataValue = value;
        modalOpen = alertDataValue != null;
    });

    afterNavigate(() => {
        alertData.set(null);
    });

    onDestroy(() => {
        unsubscribeUserData;
        unsubscribeAlertData;
    });

    // 로그아웃
    async function doLogout() {
        if (userDataValue != null) {
            userData.set(null);
            await goto(base + '/'); // 메인 페이지로 넘겨줌
        }
    }
</script>

<svelte:head>
    <style>
        .navbar {
            background: rgba(0, 0, 0, 0.8);
            padding: 0.4rem 0.8rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .navbar-brand, .nav-link {
            color: white !important;
            transition: color 0.3s ease;
        }
        .navbar-brand:hover, .nav-link:hover {
            color: #FFD700 !important;
        }
        .dropdown-menu {
            background-color: rgba(0, 0, 0, 0.8);
            border: none;
        }
        .dropdown-item {
            color: white !important;
        }
        .dropdown-item:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }
        .navbar-toggler {
            border-color: rgba(255, 255, 255, 0.1);
        }
    </style>
</svelte:head>

<Navbar class="navbar" expand="md">
    <NavbarBrand href="{base}/">나의 멘토 "나래"</NavbarBrand>
    <NavbarToggler on:click={toggleNavbar} class="navbar-toggler"/>
    <Collapse {isOpen} navbar expand="md">
        <Nav class="ms-auto" navbar>
            <NavItem>
                <NavLink href="https://github.com/cau-oss-team3">GitHub</NavLink>
            </NavItem>
            <Dropdown nav inNavbar>
                <DropdownToggle nav caret class="dropdown-toggle">계정</DropdownToggle>
                <DropdownMenu end class="dropdown-menu">
                    {#if userDataValue != null}
                        <DropdownItem class="dropdown-item">{userDataValue.email}</DropdownItem>
                        <DropdownItem divider class="dropdown-divider"/>
                        <DropdownItem class="dropdown-item" on:click={doLogout}>Logout</DropdownItem>
                    {:else}
                        <DropdownItem class="dropdown-item" href="{base}/auth/">Login</DropdownItem>
                    {/if}
                </DropdownMenu>
            </Dropdown>
        </Nav>
    </Collapse>
</Navbar>

<Modal isOpen={modalOpen} toggle={toggleModal}>
    <ModalHeader toggle={toggleModal}>알림</ModalHeader>
    <ModalBody>
        <Alert
                children={alertDataValue.err}
                color={alertDataValue.code === 500 ? 'danger' : 'warning'}
                isOpen
                fade
        />
    </ModalBody>
    <ModalFooter>
        <Button color="primary" on:click={toggleModal}>확인</Button>
    </ModalFooter>
</Modal>

<slot></slot>
