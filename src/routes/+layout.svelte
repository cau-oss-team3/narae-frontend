<script>
    import {
        Alert,
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
    import {userData, alertData} from "../stores.js";
    import {afterNavigate, goto} from "$app/navigation";
    import {PUBLIC_API_SERVER} from "$env/static/public";

    let userDataValue;
    let alertDataValue;
    let isOpen;
    let handleUpdate;

    const unsubscribeUserData = userData.subscribe(value => {
        userDataValue = value;
    });

    const unsubscribeAlertData = alertData.subscribe(value => {
        alertDataValue = value;
    });

    afterNavigate(() => {
        alertData.set(null);
    });

    onDestroy(() => {
        unsubscribeUserData;
        unsubscribeAlertData;
    });

    // 로그인
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
                alertData.set({code: json.status, err: json.err});
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
                        <DropdownItem on:click={doLogout}>Logout</DropdownItem>
                    {:else}
                        <DropdownItem href="auth/">Login</DropdownItem>
                    {/if}
                </DropdownMenu>
            </Dropdown>
        </Nav>
    </Collapse>
</Navbar>

{#if alertDataValue != null}
    {#if alertDataValue.code === 500}
        <Alert
                class=""
                children="{alertDataValue.err}"
                color="danger"
                closeClassName=""
                closeAriaLabel="Close"
                dismissible
                fade
                heading="Error"
                isOpen
                theme="auto"/>
    {:else}
        <Alert
                class=""
                children="{alertDataValue.err}"
                color="warning"
                closeClassName=""
                closeAriaLabel="Close"
                dismissible
                fade
                heading=""
                isOpen
                theme="auto"/>
    {/if}
{/if}

<slot></slot>
