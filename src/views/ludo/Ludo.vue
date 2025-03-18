<script>
import LudoToken from '@/components/LudoToken.vue';

export default {
    components: {
        LudoToken
    },
    name: 'Ludo',
    mounted() {
        // const tokens = document.getElementsByClassName('token');
        // for (let i = 0; i < tokens.length; i++) {
        //     tokens[i].style.top = `${i * 10}px`;
        //     tokens[i].style.left = `${i * 10}px`;
        // }

        const circle_red = document.querySelectorAll('.circle.red');
        const token_red = document.querySelectorAll(`#red-1, #red-2, #red-3, #red-4`);
        const outer = document.querySelector('.outer').getBoundingClientRect();
        for (let i = 0; i < circle_red.length; i++) {
            const rect = circle_red[i].getBoundingClientRect();

            token_red[i].style.border = `1px solid black`;
            token_red[i].style.top = `${(rect.top - outer.top)}px`;
            token_red[i].style.left = `${(rect.left - outer.left)}px`;
            // token_red[i].style.transform = "translate(50%, 0)";

        }
    }
}
</script>

<template>
    <div class="outer">
        <ludo-token class="token inside" id="red-1" color="red" />
        <ludo-token class="token inside" id="red-2" color="red" />
        <ludo-token class="token inside" id="red-3" color="red" />
        <ludo-token class="token inside" id="red-4" color="red" />
        <!-- <ludo-token class="token inside" id="green-1" color="green" />
        <ludo-token class="token inside" id="green-2" color="green" />
        <ludo-token class="token inside" id="green-3" color="green" />
        <ludo-token class="token inside" id="green-4" color="green" />
        <ludo-token class="token inside" id="yellow-1" color="yellow" />
        <ludo-token class="token inside" id="yellow-2" color="yellow" />
        <ludo-token class="token inside" id="yellow-3" color="yellow" />
        <ludo-token class="token inside" id="yellow-4" color="yellow" />
        <ludo-token class="token inside" id="blue-1" color="blue" />
        <ludo-token class="token inside" id="blue-2" color="blue" />
        <ludo-token class="token inside" id="blue-3" color="blue" />
        <ludo-token class="token inside" id="blue-4" color="blue" /> -->
        <div class="box_row">
            <div class="box red home-box">
                <div class="inner-box">
                    <div class="circle inside red"></div>
                    <div class="circle inside red"></div>
                    <div class="circle inside red"></div>
                    <div class="circle inside red"></div>
                </div>
            </div>
            <div class="vertical-path-segment">
                <div class="left">
                    <div class="cell"></div>
                    <div class="cell"></div>
                    <div class="cell star">&#9734;</div>
                    <div class="cell"></div>
                    <div class="cell"></div>
                    <div class="cell"></div>
                </div>
                <div class="middle">
                    <div class="cell"></div>
                    <div class="cell green"></div>
                    <div class="cell green"></div>
                    <div class="cell green"></div>
                    <div class="cell green"></div>
                    <div class="cell green"></div>
                </div>
                <div class="right">
                    <div class="cell"></div>
                    <div class="cell green"></div>
                    <div class="cell"></div>
                    <div class="cell"></div>
                    <div class="cell"></div>
                    <div class="cell"></div>
                </div>
            </div>
            <div class="box green home-box">
                <div class="inner-box">
                    <div class="circle green"></div>
                    <div class="circle green"></div>
                    <div class="circle green"></div>
                    <div class="circle green"></div>
                </div>
            </div>
        </div>
        <div class="middle_row">
            <div class="left-path-segment">
                <div class="top">
                    <div class="cell"></div>
                    <div class="cell red"></div>
                    <div class="cell"></div>
                    <div class="cell"></div>
                    <div class="cell"></div>
                    <div class="cell"></div>
                </div>
                <div class="middle">
                    <div class="cell"></div>
                    <div class="cell red"></div>
                    <div class="cell red"></div>
                    <div class="cell red"></div>
                    <div class="cell red"></div>
                    <div class="cell red"></div>
                </div>
                <div class="bottom">
                    <div class="cell"></div>
                    <div class="cell"></div>
                    <div class="cell star">&#9734;</div>
                    <div class="cell"></div>
                    <div class="cell"></div>
                    <div class="cell"></div>
                </div>
            </div>
            <div class="center-segment">
                <div class="triangle red"></div>
                <div class="triangle green"></div>
                <div class="triangle yellow"></div>
                <div class="triangle blue"></div>
            </div>
            <div class="right-path-segment">
                <div class="top">
                    <div class="cell"></div>
                    <div class="cell"></div>
                    <div class="cell"></div>
                    <div class="cell"></div>
                    <div class="cell yellow"></div>
                    <div class="cell"></div>
                </div>
                <div class="middle">
                    <div class="cell yellow"></div>
                    <div class="cell yellow"></div>
                    <div class="cell yellow"></div>
                    <div class="cell yellow"></div>
                    <div class="cell yellow"></div>
                    <div class="cell"></div>
                </div>
                <div class="bottom">
                    <div class="cell"></div>
                    <div class="cell"></div>
                    <div class="cell"></div>
                    <div class="cell star">&#9734;</div>
                    <div class="cell"></div>
                    <div class="cell"></div>
                </div>
            </div>
        </div>

        <div class="box_row">
            <div class="box blue home-box">
                <div class="inner-box">
                    <div class="circle inside blue"></div>
                    <div class="circle inside blue"></div>
                    <div class="circle inside blue"></div>
                    <div class="circle inside blue"></div>
                </div>
            </div>

            <div class="vertical-path-segment">
                <div class="left">
                    <div class="cell"></div>
                    <div class="cell"></div>
                    <div class="cell"></div>
                    <div class="cell"></div>
                    <div class="cell blue"></div>
                    <div class="cell"></div>
                </div>
                <div class="middle">
                    <div class="cell blue"></div>
                    <div class="cell blue"></div>
                    <div class="cell blue"></div>
                    <div class="cell blue"></div>
                    <div class="cell blue"></div>
                    <div class="cell"></div>
                </div>
                <div class="right">
                    <div class="cell"></div>
                    <div class="cell"></div>
                    <div class="cell"></div>
                    <div class="cell star">&#9734;</div>
                    <div class="cell"></div>
                    <div class="cell"></div>
                </div>
            </div>

            <div class="box yellow home-box">
                <div class="inner-box">
                    <div class="circle yellow"></div>
                    <div class="circle yellow"></div>
                    <div class="circle yellow"></div>
                    <div class="circle yellow"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
$canvas: min(100vw, 100vh);
$cell-size: max(calc($canvas * 0.05), 2rem);


.outer {
    position: relative;
}

.token {
    position: absolute;
}

* {
    margin: 0;
    padding: 0;
}

.box {
    height: calc(6*$cell-size);
    width: calc(6*$cell-size);
    border: 1px solid black;
}

.home-box {
    align-content: center;
}

.red {
    background-color: red;
}

.green {
    background-color: green;
}

.yellow {
    background-color: yellow;
}

.blue {
    background-color: blue;
}

.box_row {
    display: flex;
    flex-direction: row;
    justify-content: center;
}

.vertical-path-segment {
    display: flex;
    flex-direction: row;
    width: calc(calc(3*$cell-size));
}

.cell {
    border: 1px solid black;
    height: $cell-size;
    width: $cell-size;
}

.inner-box {
    background-color: white;
    border: 1px solid black;
    width: calc(4*$cell-size);
    height: calc(4*$cell-size);
    margin: auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    place-items: center;
}

.circle {
    height: calc(1.25*$cell-size);
    width: calc(1.25*$cell-size);
    border-radius: 50%;
    border: 1px solid black;
}

.middle_row {
    display: flex;
    flex-direction: row;
    height: calc(3*$cell-size);
    justify-content: center;

    .left-path-segment {
        display: flex;
        flex-direction: column;

        &>* {
            display: flex;
            flex-direction: row;
        }
    }

    .center-segment {
        width: calc(3*$cell-size);

        .triangle {
            position: absolute;
            width: calc(3*$cell-size);
            height: calc(3*$cell-size);
            border: 1px solid black;
        }

        .red {
            clip-path: polygon(0 0, 50% 50%, 0 100%);
        }

        .green {
            clip-path: polygon(100% 0, 50% 50%, 0 0);
        }

        .yellow {
            clip-path: polygon(100% 100%, 50% 50%, 100% 0);
        }

        .blue {
            clip-path: polygon(100% 100%, 50% 50%, 0 100%);
        }
    }

    .right-path-segment {
        display: flex;
        flex-direction: column-reverse;

        &>* {
            display: flex;
            flex-direction: row;
        }
    }

}

.star {
    font-size: calc(0.5*$cell-size);
    text-align: center;
    align-items: center;
    align-content: center;
}
</style>