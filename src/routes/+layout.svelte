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
    let isOpen;
    let handleUpdate;
    let open = false;

    const toggle = () => {
        open = !open;
    };

    const unsubscribeUserData = userData.subscribe((value) => {
        userDataValue = value;
    });

    const unsubscribeAlertData = alertData.subscribe((value) => {
        alertDataValue = value;
        open = alertDataValue != null;
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

<Navbar
        class=""
        container="xl"
        color="light"
        dark={false}
        expand="md"
        fixed=""
        light
        sticky=""
        theme="auto"
>
    <NavbarBrand href="{base}/">나의 과외 선생님 "나래"</NavbarBrand>
    <NavbarToggler on:click={() => (isOpen = !isOpen)}/>
    <Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
        <Nav class="ms-auto" navbar>
            <NavItem>
                <NavLink href="https://github.com/cau-oss-team3">GitHub</NavLink>
            </NavItem>
            <Dropdown nav inNavbar>
                <DropdownToggle nav caret>계정</DropdownToggle>
                <DropdownMenu end>
                    {#if userDataValue != null}
                        <DropdownItem>{userDataValue.email}</DropdownItem>
                        <DropdownItem divider/>
                        <DropdownItem on:click={() => doLogout()}>Logout</DropdownItem>
                    {:else}
                        <DropdownItem href="{base}/auth/">Login</DropdownItem>
                    {/if}
                </DropdownMenu>
            </Dropdown>
        </Nav>
    </Collapse>
</Navbar>
<Modal isOpen={open} {toggle}>
    <ModalHeader {toggle}>알림</ModalHeader>
    <ModalBody>
        <Alert
                class=""
                children={alertDataValue.err}
                color={alertDataValue.code === 500 ? 'danger' : 'warning'}
                closeClassName=""
                closeAriaLabel="Close"
                dismissible={false}
                fade
                isOpen
                theme="auto"
        />
    </ModalBody>
    <ModalFooter>
        <Button color="primary" on:click={toggle}>확인</Button>
    </ModalFooter>
</Modal>

<slot></slot>
