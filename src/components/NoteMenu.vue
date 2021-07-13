<template>
  <div
    class="mask note-menu disable-user-selection"
    v-on:click="onClickMask"
    @touchstart="onClickMask"
  >
    <div v-bind:style="style" class="my-remove-tip" id="markpannel">
      <Row v-if="showtagPane">
        <TagPanel :tags.sync="tags" />
      </Row>
      <Row type="flex" :justify="justify" align="top">
        <Col :style="col(0)" v-if="showfortxt">
          <SvgButton
            onOff
            v-bind:on="fontColorEnable"
            name="icon-ai247"
            custom
            @click="onFontColor"
            :color="fontColor"
            tips="Font Color"
          ></SvgButton>
        </Col>
        <Col :style="col(1)" v-if="showfortxt">
          <SvgButton
            onOff
            v-bind:on="UnderlineEnable"
            name="icon-xiahuaxian"
            custom
            @click="onUnderline"
            :color="underlineColor"
            tips="Underline"
          ></SvgButton>
        </Col>
        <!-- <Col :style="col(2)" v-if="showfortxt">
          <BackgroudSelector
            :colorList="colorList"
            :selectedIndex.sync="selectedSubColor"
            :key="backgroundColorKey"
        /></Col> -->
        <Col v-if="showfortxt">
          <div :class="backgroundClass">
            <div class="d1" style="background-color: white">
              <div
                class="d1"
                :style="backGroundstyle"
                v-on:click="onClickBackGround"
              >
                <span v-if="backgroundColorEnable">&#10004;</span>
              </div>
            </div>
          </div>
        </Col>
        <Col v-if="showfortxt">
          <Row type="flex" align="top">
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
              <DropColor
                :colorList="colorList"
                :selectedIndex.sync="selectedSubColor"
                :onClickDelete="onClickDelete"
              />
            </Col>
          </Row>
        </Col>
        <Col v-if="showfortxt"> </Col>
        <Col v-if="showfortxt == false">
          <SvgButton
            name="icon-zoom-out"
            custom
            @click="zoomoutImg"
          ></SvgButton>
        </Col>
        <Col>
          <SvgButton
            name="icon-tags-fill"
            custom
            :on.sync="showtagPane"
          ></SvgButton>
        </Col>
        <Col>
          <SvgButton @click="onBookmark" :name="bookmarkicon" />
        </Col>
        <Col>
          <SvgButton
            v-if="imageNeedAdd"
            @click="imageNeedAdd = false"
            name="md-add-circle"
            tips="Remove"
          />
          <SvgButton
            v-if="imageNeedAdd == false"
            @click="onDelete"
            name="md-trash"
            tips="Remove"
          />
        </Col>
        <Col>
          <SvgButton @click="onCopy" name="ios-copy" tips="Copy" />
        </Col>
        <Col>
          <Badge dot :count="notecouter" :offset="[20, 10]">
            <SvgButton
              @click="openEditor"
              name="md-create"
              tips="EditTextTips"
            />
          </Badge>
        </Col>
      </Row>
    </div>
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
.backgroundClass {
  border-bottom: 2px solid white;
  padding-bottom: 1px;
}
.my-remove-tip {
  box-sizing: border-box;
  position: absolute;
  border: 1px solid #fff;
  border-radius: 3px;
  width: 440px;
  height: fit-content;
  background: var(--theme-color, #42b983);
  font-size: 12px;
  cursor: pointer;
  /* line-height: 18px; */
  overflow: visible;
  padding: 4px;
  padding-bottom: 1px;
}

.my-remove-tip .ivu-col {
  padding-bottom: 2px;
}
@media screen and (max-width: 640px) {
  .my-remove-tip {
    width: 100%;
    /* width:360px */
  }
}
</style>
