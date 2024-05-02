<script>
    import {
        Collapse,
        Dropdown, DropdownItem, DropdownMenu, DropdownToggle,
        Nav,
        Navbar,
        NavbarBrand,
        NavbarToggler,
        NavItem,
        NavLink
    } from "@sveltestrap/sveltestrap";
    import { onDestroy } from 'svelte';
    import {userData} from "../stores.js";
    import {goto} from "$app/navigation";

    let userDataValue;
    let isOpen;
    let handleUpdate;

    const unsubscribe = userData.subscribe(value => {
        userDataValue = value;
    });

    onDestroy(unsubscribe);

    function logout() {
        if (userDataValue != null) {
            //TODO 로그아웃 API 연동
            userData.set(null);
            goto('/');
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
                        <DropdownItem on:click={logout}>Logout</DropdownItem>
                    {:else}
                        <DropdownItem href="auth/">Login</DropdownItem>
                    {/if}
                </DropdownMenu>
            </Dropdown>
        </Nav>
    </Collapse>
</Navbar>

<slot></slot>
