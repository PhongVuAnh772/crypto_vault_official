.PHONY: all datn report clean

LATEXMK := latexmk
LATEXOPTS := -pdf -xelatex -interaction=nonstopmode -file-line-error
BUILD_DIR := build
DATN_SRC := DATN-Doc.tex
REPORT_SRC := docs/cryptovault_report.tex

all: datn report

datn: $(BUILD_DIR) $(BUILD_DIR)/DATN-Doc.pdf

report: $(BUILD_DIR) $(BUILD_DIR)/cryptovault_report.pdf

$(BUILD_DIR):
	mkdir -p $@

$(BUILD_DIR)/DATN-Doc.pdf: $(DATN_SRC)
	cd $(BUILD_DIR) && $(LATEXMK) $(LATEXOPTS) "../$(DATN_SRC)"

$(BUILD_DIR)/cryptovault_report.pdf: $(REPORT_SRC)
	cd $(BUILD_DIR) && $(LATEXMK) $(LATEXOPTS) "../$(REPORT_SRC)"

clean:
	rm -rf $(BUILD_DIR)/*.aux $(BUILD_DIR)/*.fdb_latexmk $(BUILD_DIR)/*.fls \
		$(BUILD_DIR)/*.log $(BUILD_DIR)/*.out $(BUILD_DIR)/*.pdf $(BUILD_DIR)/*.toc \
		$(BUILD_DIR)/*.synctex.gz $(BUILD_DIR)/*.bbl $(BUILD_DIR)/*.blg
