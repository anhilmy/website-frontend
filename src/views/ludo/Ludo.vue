<script>
export default {
    setup() {

    },
}
</script>

<template>
    <div class="outer">
        <div class="box_row">
            <div class="box red home-box">
                <div class="inner-box">
                    <div class="circle inside red"></div>
                    <div class="circle inside red"></div>
                    <div class="circle inside red"></div>
                    <div class="circle inside red"></div>
                </div>
            </div>
            <div class="north-path-segment">
                <div class="left">
                    <div class="cell"></div>
                    <div class="cell"></div>
                    <div class="cell"></div>
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
                    <div class="cell"></div>
                    <div class="cell"></div>
                    <div class="cell"></div>
                    <div class="cell"></div>
                </div>
            </div>
            <div class="center-segment"></div>
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
                    <div class="cell"></div>
                    <div class="cell"></div>
                    <div class="cell"></div>
                </div>
            </div>
        </div>

        <!-- <div class="middle_row">
            <div class="h_lad">
                <div class="h_lad_row">
                    <div class="h_lad_cell"></div>
                    <div class="h_lad_cell red"><span class="star">&#9733;</span></div>
                    <div class="h_lad_cell"></div>
                    <div class="h_lad_cell"></div>
                    <div class="h_lad_cell"></div>
                    <div class="h_lad_cell"></div>
                </div>
                <div class="h_lad_row">
                    <div class="h_lad_cell"></div>
                    <div class="h_lad_cell red"></div>
                    <div class="h_lad_cell red"></div>
                    <div class="h_lad_cell red"></div>
                    <div class="h_lad_cell red"></div>
                    <div class="h_lad_cell red"></div>
                </div>
                <div class="h_lad_row">
                    <div class="h_lad_cell"></div>
                    <div class="h_lad_cell"></div>
                    <div class="h_lad_cell red"><span class="star">&#9733;</span></div>
                    <div class="h_lad_cell"></div>
                    <div class="h_lad_cell"></div>
                    <div class="h_lad_cell"></div>
                </div>
            </div>
            <div class="ludo_home"></div>
            <div class="h_lad">
                <div class="h_lad_row">
                    <div class="h_lad_cell"></div>
                    <div class="h_lad_cell"></div>
                    <div class="h_lad_cell"></div>
                    <div class="h_lad_cell yellow"><span class="star">&#9733;</span></div>
                    <div class="h_lad_cell"></div>
                    <div class="h_lad_cell"></div>
                </div>
                <div class="h_lad_row">
                    <div class="h_lad_cell yellow"></div>
                    <div class="h_lad_cell yellow"></div>
                    <div class="h_lad_cell yellow"></div>
                    <div class="h_lad_cell yellow"></div>
                    <div class="h_lad_cell yellow"></div>
                    <div class="h_lad_cell "></div>
                </div>
                <div class="h_lad_row">
                    <div class="h_lad_cell"></div>
                    <div class="h_lad_cell"></div>
                    <div class="h_lad_cell"></div>
                    <div class="h_lad_cell"></div>
                    <div class="h_lad_cell yellow"><span class="star">&#9733;</span></div>
                    <div class="h_lad_cell"></div>
                </div>
            </div>

        </div>
        <div class="box_row">
            <div class="box" style="border:50px solid blue;">
                <div class="circle border_blue"></div>
                <div class="circle border_blue"></div>
                <div class="circle border_blue"></div>
                <div class="circle border_blue"></div>
            </div>
            <div class="v_lad">
                <div class="v_lad_row">
                    <div class="v_lad_cell"></div>
                    <div class="v_lad_cell blue"></div>
                    <div class="v_lad_cell"></div>
                </div>
                <div class="v_lad_row">
                    <div class="v_lad_cell"></div>
                    <div class="v_lad_cell blue"></div>
                    <div class="v_lad_cell "></div>
                </div>
                <div class="v_lad_row">
                    <div class="v_lad_cell"></div>
                    <div class="v_lad_cell blue"></div>
                    <div class="v_lad_cell"></div>
                </div>
                <div class="v_lad_row">
                    <div class="v_lad_cell"></div>
                    <div class="v_lad_cell blue"></div>
                    <div class="v_lad_cell blue"><span class="star">&#9733;</span></div>
                </div>
                <div class="v_lad_row">
                    <div class="v_lad_cell blue "><span class="star">&#9733;</span></div>
                    <div class="v_lad_cell blue"></div>
                    <div class="v_lad_cell"></div>
                </div>
                <div class="v_lad_row">
                    <div class="v_lad_cell"></div>
                    <div class="v_lad_cell"></div>
                    <div class="v_lad_cell"></div>
                </div>
            </div>
            <div class="box" style="border:50px solid yellow;">
                <div class="circle border_yellow"></div>
                <div class="circle border_yellow"></div>
                <div class="circle border_yellow"></div>
                <div class="circle border_yellow"></div>
            </div>
        </div> -->
    </div>
</template>

<style lang="scss" scoped>
$cell-size: 2rem;

* {
    margin: 0;
    padding: 0;
}

.box {
    height: 6*$cell-size;
    width: 6*$cell-size;
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

.box_row {
    display: flex;
    flex-direction: row;
    justify-content: center;
}

.north-path-segment {
    display: flex;
    flex-direction: row;
    width: 3*$cell-size;
}

.cell {
    border: 1px solid black;
    height: $cell-size;
    width: $cell-size;
}

.inner-box {
    background-color: white;
    border: 1px solid black;
    width: 4*$cell-size;
    height: 4*$cell-size;
    margin: auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    place-items: center;
}

.circle {
    height: 1.25*$cell-size;
    width: 1.25*$cell-size;
    border-radius: 50%;
    border: 1px solid black;
}

.middle_row {
    display: flex;
    flex-direction: row;
    height: 3*$cell-size;
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
        width: 3*$cell-size;
        border-left: 1.5*$cell-size solid red;
        border-right: 1.5*$cell-size solid yellow;
        border-top: 1.5*$cell-size solid green;
        border-bottom: 1.5*$cell-size solid blue;
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



/* .outer {
    height: 750px;
    width: 750px;
    margin: 0px auto;
    border: 1px solid red;
}

.box_row {
    height: 300px;
    width: 750px;
}

.box {
    height: 200px;
    width: 200px;
    float: left;
    background: #ccc;
}

.v_lad {
    height: 300px;
    width: 150px;
    float: left;
}

.circle {
    height: 50px;
    width: 50px;
    margin: 25px;
    border-radius: 50%;
    box-sizing: border-box;
    float: left;
}

.border_red {
    border: 5px solid red;
}

.border_green {
    border: 5px solid green;
}

.border_blue {
    border: 5px solid blue;
}

.border_yellow {
    border: 5px solid yellow;
}

.v_lad_row {
    height: 50px;
    width: 150px;
}

.v_lad_cell {
    height: 50px;
    width: 50px;
    border: 1px solid #000;
    box-sizing: border-box;
    float: left;
    text-align: center;
}

.red {
    background: red;
}

.green {
    background: green;
}

.blue {
    background: blue;
}

.yellow {
    background: yellow;
}

.middle_row {
    height: 150px;
    width: 750px;

}

.h_lad {
    height: 150px;
    width: 300px;
    float: left;
}

.h_lad_row {
    height: 50px;
    width: 300px;
    float: left;
}

.h_lad_cell {
    height: 50px;
    width: 50px;
    border: 1px solid #000;
    float: left;
    box-sizing: border-box;
    text-align: center;
}

.ludo_home {
    height: 0;
    width: 0;
    border-left: 75px solid red;
    border-right: 75px solid yellow;
    border-top: 75px solid green;
    border-bottom: 75px solid blue;
    float: left;
}

.star {
    font-size: 32px;
    text-align: center;
} */
</style>