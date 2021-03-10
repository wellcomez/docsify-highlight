<template>
  <div class="mask note-menu" v-on:click="onClickMask">
    <Row v-bind:style="style" class="my-remove-tip" id="markpannel" type="flex">
      <Col>
        <SvgButton
          onOff
          v-bind:on="UnderlineEnable"
          name="ul"
          v-bind:onClick="onUnderline"
          tips="Underline"
        ></SvgButton>
      </Col>
      <Col>
        <div class="d1 hlyellow" v-on:click="onYellow">
          <span v-if="isYellow">&#10004;</span>
        </div>
      </Col>
      <Col>
        <div class="d1 hlred" v-on:click="onRed">
          <span v-if="isRed">&#10004;</span>
        </div>
      </Col>
      <Col>
        <div class="d1 hlgreen" v-on:click="onGreen">
          <span v-if="isGreen">&#10004;</span>
        </div>
      </Col>
      <Col>
        <ColorPicker
          offset="[-1,1]"
          v-model="color1"
          alpha
          recommend
          @on-change="onChangeColor"
          :class="classColorPicker"
          size="small"
        />
      </Col>
      <Col>
        <SvgButton v-bind:onClick="onDelete" name="del" tips="Remove" />
      </Col>
      <Col>
        <SvgButton v-bind:onClick="onCopy" name="copy" tips="Copy" />
      </Col>
      <Col>
        <Badge dot :count="notecouter" :offset="[20, 10]">
          <Tooltip :content="EditTextTips">
            <Button @click="openEditor" class="note-color-picker" size="small">
              <Icon type="md-create" />
            </Button>
          </Tooltip>
        </Badge>
      </Col>
    </Row>
  </div>
</template>






<script>
import { NoteMenu } from "./NoteMenu";
export default NoteMenu;
</script>
<style>
@import "../assets/web.css";
.note-color-picker,
.note-color-picker-selected {
  margin: 2px;
}
</style>
.note-color-picker-selected{
  border: 1px solid var(--theme-color, #42b983)
}
<style scoped>
.button {
  height: 22px;
  padding: 1px;
  width: 22px;
  margin: 4px;
  border: 1px;
  border-radius: 3px;
}
.button {
  width: fit-content;
  font-size: small;
}
</style>
<style type="text/css">
.icon-del {
  /* background-image: url(../assets/del.svg); */
  background-size: 16px 16px;
  background-position: 2px 2px;
  background-repeat: no-repeat;
  padding: 2px 2px 2px 2px;
  border: 1px solid #ddd;
  margin: 4px;
  width: 30px;
  border-radius: 3px;
  text-align: center;
  height: 22px;
}
.my-remove-tip {
  box-sizing: border-box;
  position: absolute;
  border: 1px solid #fff;
  border-radius: 3px;
  width: fit-content;
  height: 30px;
  /* width        : 90px; */
  color: #fff;
  background: rgb(226, 223, 223);
  /* text-align   : center; */
  font-size: 12px;
  cursor: pointer;
  line-height: 18px;
  overflow: visible;
}
</style>
