<script>
    import {
        Alert, Button,
        Collapse,
        Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Modal, ModalBody, ModalFooter, ModalHeader,
        Nav,
        Navbar,
        NavbarBrand,
        NavbarToggler,
        NavItem,
        NavLink
    } from "@sveltestrap/sveltestrap";
    import { onDestroy } from 'svelte';
    import {userData, alertData} from "../stores.js";
    import {afterNavigate, goto} from "$app/navigation";
    import {PUBLIC_API_SERVER} from "$env/static/public";

    let userDataValue;
    let alertDataValue;
    let isOpen;
    let handleUpdate;
    let open = false;

    const toggle = () => {
        open = !open;
    };

    const unsubscribeUserData = userData.subscribe(value => {
        userDataValue = value;
    });

    const unsubscribeAlertData = alertData.subscribe(value => {
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
    async function doLogout () {
        if (userDataValue != null) {
            const res = await fetch(PUBLIC_API_SERVER + '/auth/logout', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "access-token": userDataValue.token
                },
            })

            const json = await res.json()

            if (json.isSuccess) {
                userData.set(null);
                goto('/'); //메인 페이지로 넘겨줌

            } else {
                alertData.set({code:res.status, err: json.err});
            }
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
        theme="auto">

    <NavbarBrand href="/">나의 과외 선생님 "나래"</NavbarBrand>
    <NavbarToggler on:click={() => (isOpen = !isOpen)} />
    <Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
        <Nav class="ms-auto" navbar>
            <NavItem>
                <NavLink href="test/">테스트</NavLink> <!-- TODO 배포전 삭제 -->
            </NavItem>
            <NavItem>
                <NavLink href="https://github.com/cau-oss-team3">GitHub</NavLink>
            </NavItem>
            <Dropdown nav inNavbar>
                <DropdownToggle nav caret>계정</DropdownToggle>
                <DropdownMenu end>
                    {#if userDataValue != null}
                        <DropdownItem>{userDataValue.email}</DropdownItem>
                        <DropdownItem divider />
                        <DropdownItem on:click={() => doLogout()}>Logout</DropdownItem>
                    {:else}
                        <DropdownItem href="auth/">Login</DropdownItem>
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
            children="{alertDataValue.err}"
            color="{alertDataValue.code === 500? 'danger' : 'warning'}"
            closeClassName=""
            closeAriaLabel="Close"
            dismissible={false}
            fade
            isOpen
            theme="auto"/>
    </ModalBody>
    <ModalFooter>
        <Button color="primary" on:click={toggle}>확인</Button>
    </ModalFooter>
</Modal>

<slot></slot>
