<template>
  <div
    class="mask note-menu"
    v-on:click="onClickMask"
    @touchstart="onClickMask"
  >
    <Row v-bind:style="style" class="my-remove-tip" id="markpannel" type="flex" justify="space-between" align="top">
      <Col :style="col(0)">
        <SvgButton
          onOff
          v-bind:on="fontColorEnable"
          name="icon-ai247"
          custom
          v-bind:onClick="onFontColor"
          :color="fontColor"
          tips="Font Color"
        ></SvgButton>
      </Col>
      <Col :style="col(1)">
        <SvgButton
          onOff
          v-bind:on="UnderlineEnable"
          name="icon-xiahuaxian"
          custom
          v-bind:onClick="onUnderline"
          :color="underlineColor"
          tips="Underline"
        ></SvgButton>
      </Col>
      <Col :style="col(2)">
        <BackgroudSelector
          :colorList="colorList"
          :selectedIndex.sync="selectedSubColor"
          :key="backgroundColorKey"
      /></Col>
      <Col>
        <ColorPicker
          offset="[-1,1]"
          v-model="color1"
          alpha
          :colors="recommendedColor"
          @on-change="onChangeColorPicker"
          :class="classColorPicker"
          :key="hlType"
        />
      </Col>
      <Col>
        <SvgButton v-bind:onClick="onDelete" name="md-trash" tips="Remove" />
      </Col>
      <Col>
        <SvgButton v-bind:onClick="onCopy" name="ios-copy" tips="Copy" />
      </Col>
      <Col>
        <Badge dot :count="notecouter" :offset="[20, 10]">
          <SvgButton
            v-bind:onClick="openEditor"
            name="md-create"
            tips="EditTextTips"
          />
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
</style>
.note-color-picker-selected{
  border: 1px solid var(--theme-color, #42b983)
}
<style type="text/css">
.my-remove-tip {
  box-sizing: border-box;
  position: absolute;
  border: 1px solid #fff;
  border-radius: 3px;
  width: 360px;
  height: fit-content;
  background: var(--theme-color, #42b983);
  font-size: 12px;
  cursor: pointer;
  /* line-height: 18px; */
  overflow: visible;
  padding: 4px;
  padding-bottom:1px;
}

.my-remove-tip .ivu-col {
  padding-bottom: 2px;
}
@media screen and (max-width: 640px) {
  .my-remove-tip{
    width:360px
  }
}
</style>
