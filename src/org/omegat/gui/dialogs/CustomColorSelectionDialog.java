/**************************************************************************
 OmegaT - Computer Assisted Translation (CAT) tool 
          with fuzzy matching, translation memory, keyword search, 
          glossaries, and translation leveraging into updated projects.

 Copyright (C) 2014 Briac Pilpre
               2015 Aaron Madlon-Kay
               Home page: http://www.omegat.org/
               Support center: http://groups.yahoo.com/group/OmegaT/

 This file is part of OmegaT.

 OmegaT is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 OmegaT is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **************************************************************************/

package org.omegat.gui.dialogs;

import java.awt.Color;
import java.lang.reflect.Array;
import java.lang.reflect.Field;

import javax.swing.JColorChooser;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JSlider;
import javax.swing.JSpinner;
import javax.swing.colorchooser.AbstractColorChooserPanel;

import org.omegat.util.OStrings;
import org.omegat.util.Preferences;
import org.omegat.util.gui.StaticUIUtils;
import org.omegat.util.gui.Styles;
import org.omegat.util.gui.Styles.EditorColor;

/**
 * Dialog for configuring custom colors.
 * 
 * @author Briac Pilpre
 * @author Aaron Madlon-Kay
 */
@SuppressWarnings("serial")
public class CustomColorSelectionDialog extends javax.swing.JDialog {

    /**
     * Creates new form CustomColorSelectionDialog
     */
    public CustomColorSelectionDialog(java.awt.Frame parent, boolean modal) {
        super(parent, modal);
        initComponents();
        StaticUIUtils.setEscapeClosable(this);
    }

    /**
     * This method is called from within the constructor to initialize the form.
     * WARNING: Do NOT modify this code. The content of this method is always
     * regenerated by the Form Editor.
     */
    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {

        sampleEditorPane = new javax.swing.JEditorPane();
        colorStylesLabel = new javax.swing.JLabel();
        jScrollPane1 = new javax.swing.JScrollPane();
        colorStylesList = new javax.swing.JList(Styles.EditorColor.values());
        colorChooser = new javax.swing.JColorChooser();
        applyColorChangesButton = new javax.swing.JButton();
        defaultColorButton = new javax.swing.JButton();
        setColorButton = new javax.swing.JButton();
        cancelButton = new javax.swing.JButton();

        sampleEditorPane.setEditable(false);
        sampleEditorPane.setText("Sample translation text");
        sampleEditorPane.setMinimumSize(new java.awt.Dimension(400, 100));
        sampleEditorPane.setName(""); // NOI18N
        sampleEditorPane.setPreferredSize(new java.awt.Dimension(400, 100));
        sampleEditorPane.setRequestFocusEnabled(false);

        setDefaultCloseOperation(javax.swing.WindowConstants.DISPOSE_ON_CLOSE);
        setTitle(OStrings.getString("GUI_COLORS_TITLE")); // NOI18N
        setIconImage(null);

        org.openide.awt.Mnemonics.setLocalizedText(colorStylesLabel, OStrings.getString("GUI_COLORS_COLOR")); // NOI18N

        colorStylesList.setSelectionMode(javax.swing.ListSelectionModel.SINGLE_SELECTION);
        colorStylesList.addListSelectionListener(new javax.swing.event.ListSelectionListener() {
            public void valueChanged(javax.swing.event.ListSelectionEvent evt) {
                colorStylesListValueChanged(evt);
            }
        });
        jScrollPane1.setViewportView(colorStylesList);

        /*
        final CustomColorPreview samplePanel = new CustomColorPreview(colorChooser, colorStylesList.getSelectedValue());

        colorChooser.setPreviewPanel(samplePanel);
        ColorSelectionModel model = colorChooser.getSelectionModel();
        model.addChangeListener(new ChangeListener() {
            public void stateChanged(ChangeEvent evt) {
                ColorSelectionModel model = (ColorSelectionModel) evt.getSource();
                samplePanel.curColor = model.getSelectedColor();
            }
        });
        */

        try {
            removeTransparencySlider(colorChooser);
        }
        catch (Exception e) {
            /* empty */
        }

        // Remove sample Swatches
        javax.swing.colorchooser.AbstractColorChooserPanel[] oldPanels = colorChooser.getChooserPanels();
        for (int i = 0; i < oldPanels.length; i++) {
            String clsName = oldPanels[i].getClass().getName();
            if (clsName.equals("javax.swing.colorchooser.DefaultSwatchChooserPanel")) {
                colorChooser.removeChooserPanel(oldPanels[i]);
            }
        }

        org.openide.awt.Mnemonics.setLocalizedText(applyColorChangesButton, OStrings.getString("GUI_COLORS_APPLY")); // NOI18N
        applyColorChangesButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                applyColorChangesButtonActionPerformed(evt);
            }
        });

        org.openide.awt.Mnemonics.setLocalizedText(defaultColorButton, OStrings.getString("GUI_COLORS_DEFAULT_COLOR")); // NOI18N
        defaultColorButton.setVerticalAlignment(javax.swing.SwingConstants.TOP);
        defaultColorButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                defaultColorButtonActionPerformed(evt);
            }
        });

        org.openide.awt.Mnemonics.setLocalizedText(setColorButton, OStrings.getString("GUI_COLORS_SET_COLOR")); // NOI18N
        setColorButton.setToolTipText("");
        setColorButton.setVerticalAlignment(javax.swing.SwingConstants.TOP);
        setColorButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                setColorButtonActionPerformed(evt);
            }
        });

        org.openide.awt.Mnemonics.setLocalizedText(cancelButton, OStrings.getString("BUTTON_CANCEL")); // NOI18N
        cancelButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                cancelButtonActionPerformed(evt);
            }
        });

        javax.swing.GroupLayout layout = new javax.swing.GroupLayout(getContentPane());
        getContentPane().setLayout(layout);
        layout.setHorizontalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(layout.createSequentialGroup()
                .addContainerGap()
                .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addGroup(layout.createSequentialGroup()
                        .addComponent(colorStylesLabel)
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.UNRELATED)
                        .addComponent(jScrollPane1, javax.swing.GroupLayout.DEFAULT_SIZE, 267, Short.MAX_VALUE)
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.UNRELATED)
                        .addComponent(colorChooser, javax.swing.GroupLayout.PREFERRED_SIZE, 639, javax.swing.GroupLayout.PREFERRED_SIZE))
                    .addGroup(javax.swing.GroupLayout.Alignment.TRAILING, layout.createSequentialGroup()
                        .addGap(0, 0, Short.MAX_VALUE)
                        .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING, false)
                            .addGroup(javax.swing.GroupLayout.Alignment.TRAILING, layout.createSequentialGroup()
                                .addComponent(cancelButton)
                                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                                .addComponent(applyColorChangesButton))
                            .addComponent(defaultColorButton, javax.swing.GroupLayout.Alignment.TRAILING, javax.swing.GroupLayout.DEFAULT_SIZE, 281, Short.MAX_VALUE)
                            .addComponent(setColorButton, javax.swing.GroupLayout.Alignment.TRAILING, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))))
                .addContainerGap())
        );
        layout.setVerticalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(layout.createSequentialGroup()
                .addContainerGap()
                .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addComponent(jScrollPane1, javax.swing.GroupLayout.PREFERRED_SIZE, 169, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.TRAILING)
                        .addGroup(layout.createSequentialGroup()
                            .addComponent(colorStylesLabel)
                            .addGap(320, 320, 320))
                        .addComponent(colorChooser, javax.swing.GroupLayout.PREFERRED_SIZE, 336, javax.swing.GroupLayout.PREFERRED_SIZE)))
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addComponent(setColorButton)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addComponent(defaultColorButton)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED, 18, Short.MAX_VALUE)
                .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(applyColorChangesButton)
                    .addComponent(cancelButton))
                .addContainerGap())
        );

        pack();
    }// </editor-fold>//GEN-END:initComponents

    private void colorStylesListValueChanged(javax.swing.event.ListSelectionEvent evt) {//GEN-FIRST:event_colorStylesListValueChanged
        Color selectedColor = ((Styles.EditorColor) colorStylesList.getSelectedValue()).getColor();
        if (selectedColor == null)
        {
            selectedColor = Color.WHITE;
        }
        colorChooser.setColor(selectedColor);
    }//GEN-LAST:event_colorStylesListValueChanged

    private void defaultColorButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_defaultColorButtonActionPerformed
        EditorColor editorColor = (Styles.EditorColor) colorStylesList.getSelectedValue();
        if (editorColor == null) {
            return;
        }
        editorColor.setColor(null);
        colorChooser.setColor(editorColor.getColor());
        
    }//GEN-LAST:event_defaultColorButtonActionPerformed

    private void setColorButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_setColorButtonActionPerformed
        EditorColor editorColor = (Styles.EditorColor) colorStylesList.getSelectedValue();
        if (editorColor == null) {
            return;
        }
        editorColor.setColor(colorChooser.getColor());
    }//GEN-LAST:event_setColorButtonActionPerformed

    private void applyColorChangesButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_applyColorChangesButtonActionPerformed
        Preferences.save();
        JOptionPane.showMessageDialog(null, OStrings.getString("GUI_COLORS_CHANGED_RESTART"));
        closeDialog();
    }//GEN-LAST:event_applyColorChangesButtonActionPerformed

    private void cancelButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_cancelButtonActionPerformed
        closeDialog();
    }//GEN-LAST:event_cancelButtonActionPerformed

    private void closeDialog() {
        setVisible(false);
        dispose();
    }

    /**
     * @param args the command line arguments
     */
    public static void main(String args[]) {
        /* Create and display the dialog */
        java.awt.EventQueue.invokeLater(new Runnable() {
            public void run() {
                CustomColorSelectionDialog dialog = new CustomColorSelectionDialog(new javax.swing.JFrame(), true);
                dialog.addWindowListener(new java.awt.event.WindowAdapter() {
                    @Override
                    public void windowClosing(java.awt.event.WindowEvent e) {
                        System.exit(0);
                    }
                });
                dialog.setVisible(true);
            }
        });
    }
    
//    private class CustomColorPreview extends JTextArea
//    {
//        EditorColor editorColor;
//		Color curColor;
//
//        CustomColorPreview(JColorChooser colorChooser, Object object)
//        {
//            curColor = colorChooser.getColor();
//            this.editorColor = (Styles.EditorColor) object;
//            init();
//        }
//        
//        public void init()
//        {
//            setText(
//    "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.");
//            setBackground(Styles.EditorColor.COLOR_BACKGROUND.getColor());
//            setForeground(Styles.EditorColor.COLOR_FOREGROUND.getColor());
//            Highlighter highlighter = getHighlighter();
//
//            WaveUnderline hlSpellcheck = new UnderlineFactory.WaveUnderline(Styles.EditorColor.COLOR_SPELLCHECK.getColor());
//            try {
//    			highlighter.addHighlight(45, 55, hlSpellcheck);
//    		} catch (BadLocationException e) {
//    			/* ignore */
//    		}
//        }
//        
//        public void paint(Graphics g)
//        {
//        	//super.paint(g);
//            g.setColor(curColor);
//            g.fillRect(0, 0, 50, 50);
//        }
//    }

    // Hide the Transparency Slider.
    // From: http://stackoverflow.com/a/22608885
    private void removeTransparencySlider(JColorChooser jc) throws Exception {

    AbstractColorChooserPanel[] colorPanels = jc.getChooserPanels();
    for (int i = 1; i < colorPanels.length; i++) {
        AbstractColorChooserPanel cp = colorPanels[i];

        Field f = cp.getClass().getDeclaredField("panel");
        f.setAccessible(true);

        Object colorPanel = f.get(cp);
        Field f2 = colorPanel.getClass().getDeclaredField("spinners");
        f2.setAccessible(true);
        Object spinners = f2.get(colorPanel);

        Object transpSlispinner = Array.get(spinners, 3);
        if (i == colorPanels.length - 1) {
            transpSlispinner = Array.get(spinners, 4);
        }
        Field f3 = transpSlispinner.getClass().getDeclaredField("slider");
        f3.setAccessible(true);
        JSlider slider = (JSlider) f3.get(transpSlispinner);
        slider.setEnabled(false);
        slider.setVisible(false);
        Field f4 = transpSlispinner.getClass().getDeclaredField("spinner");
        f4.setAccessible(true);
        JSpinner spinner = (JSpinner) f4.get(transpSlispinner);
        spinner.setEnabled(false);
        spinner.setVisible(false);

        Field f5 = transpSlispinner.getClass().getDeclaredField("label");
        f5.setAccessible(true);
        JLabel label = (JLabel) f5.get(transpSlispinner);
        label.setVisible(false);
    }
}
    
    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JButton applyColorChangesButton;
    private javax.swing.JButton cancelButton;
    private javax.swing.JColorChooser colorChooser;
    private javax.swing.JLabel colorStylesLabel;
    private javax.swing.JList colorStylesList;
    private javax.swing.JButton defaultColorButton;
    private javax.swing.JScrollPane jScrollPane1;
    private javax.swing.JEditorPane sampleEditorPane;
    private javax.swing.JButton setColorButton;
    // End of variables declaration//GEN-END:variables
}
